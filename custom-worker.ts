/**
 * Custom worker entry point that wraps OpenNext's worker and adds our Durable Objects.
 * This is used as the main entry point in wrangler.jsonc.
 *
 * Handles WebSocket upgrades for /api/ws/connect before passing to OpenNext.
 */

// Re-export the default handler from OpenNext
// @ts-ignore - Generated at build time by OpenNext
import openNextWorker from './.open-next/worker.js';

// Re-export OpenNext's internal Durable Objects
// @ts-ignore - Generated at build time by OpenNext
export { DOQueueHandler } from './.open-next/worker.js';
// @ts-ignore - Generated at build time by OpenNext
export { DOShardedTagCache } from './.open-next/worker.js';
// @ts-ignore - Generated at build time by OpenNext
export { BucketCachePurge } from './.open-next/worker.js';

// Export our custom Durable Objects for WebSocket
export { ConversationWebSocket } from './src/durable-objects/conversation-ws';
export { CartWebSocket } from './src/durable-objects/cart-ws';
export { UserWebSocket } from './src/durable-objects/user-ws';

interface ConversationTokenData {
	userId: number;
	conversationId: number;
	exp: number;
}

interface CartTokenData {
	userId: number;
	cartUserId: number;
	role: 'owner' | 'agent';
	exp: number;
}

interface UserTokenData {
	userId: number;
	type: 'user';
	exp: number;
}

interface ConversationTokenValidationResult {
	data: ConversationTokenData | null;
	error: string | null;
}

interface CartTokenValidationResult {
	data: CartTokenData | null;
	error: string | null;
}

interface UserTokenValidationResult {
	data: UserTokenData | null;
	error: string | null;
}

/**
 * Verify HMAC-SHA256 signature using Web Crypto API
 */
async function verifySignature(
	payload: string,
	signature: string,
	secret: string
): Promise<boolean> {
	try {
		const encoder = new TextEncoder();
		const keyData = encoder.encode(secret);
		const messageData = encoder.encode(payload);

		const key = await crypto.subtle.importKey(
			'raw',
			keyData,
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['verify']
		);

		// Decode base64url signature
		const sigBytes = Uint8Array.from(
			atob(signature.replace(/-/g, '+').replace(/_/g, '/')),
			(c) => c.charCodeAt(0)
		);

		return await crypto.subtle.verify('HMAC', key, sigBytes, messageData);
	} catch (e) {
		console.error('Signature verification error:', e);
		return false;
	}
}

/**
 * Validate and decode a WebSocket token.
 * Token format: base64url(payload).base64url(signature)
 * Returns the decoded payload or null if invalid.
 */
async function validateTokenPayload<T>(
	token: string,
	authSecret: string
): Promise<{ data: T | null; error: string | null }> {
	// Split token into payload and signature
	const parts = token.split('.');
	if (parts.length !== 2) {
		console.error('Token validation failed: invalid format (expected payload.signature)');
		return { data: null, error: 'Invalid token format' };
	}

	const [payload, signature] = parts;

	// Verify signature first
	const isValid = await verifySignature(payload, signature, authSecret);
	if (!isValid) {
		console.error('Token validation failed: signature verification failed');
		return { data: null, error: 'Invalid signature' };
	}

	// Decode and parse payload
	let decoded: T & { exp?: number };
	try {
		decoded = JSON.parse(
			Buffer.from(payload, 'base64url').toString('utf-8')
		) as T & { exp?: number };
	} catch (e) {
		console.error('Token validation failed: payload decode/parse error', {
			error: e instanceof Error ? e.message : String(e),
		});
		return { data: null, error: 'Invalid payload' };
	}

	// Check expiry
	const now = Math.floor(Date.now() / 1000);
	if (decoded.exp && decoded.exp < now) {
		console.warn('Token validation failed: token expired', {
			expiredAt: decoded.exp,
			now,
			expiredSecondsAgo: now - decoded.exp,
		});
		return { data: null, error: 'Token expired' };
	}

	return { data: decoded, error: null };
}

/**
 * Validate conversation WebSocket token
 */
async function validateConversationToken(
	token: string,
	authSecret: string
): Promise<ConversationTokenValidationResult> {
	const result = await validateTokenPayload<ConversationTokenData>(token, authSecret);
	if (!result.data) {
		return result;
	}

	// Validate required fields for conversation token
	if (!result.data.userId || !result.data.conversationId) {
		console.error('Conversation token validation failed: missing required fields', {
			hasUserId: !!result.data.userId,
			hasConversationId: !!result.data.conversationId,
		});
		return { data: null, error: 'Missing required fields' };
	}

	return result;
}

/**
 * Validate cart WebSocket token
 */
async function validateCartToken(
	token: string,
	authSecret: string
): Promise<CartTokenValidationResult> {
	const result = await validateTokenPayload<CartTokenData>(token, authSecret);
	if (!result.data) {
		return result;
	}

	// Validate required fields for cart token
	if (!result.data.userId || !result.data.cartUserId || !result.data.role) {
		console.error('Cart token validation failed: missing required fields', {
			hasUserId: !!result.data.userId,
			hasCartUserId: !!result.data.cartUserId,
			hasRole: !!result.data.role,
		});
		return { data: null, error: 'Missing required fields' };
	}

	// Validate role is valid
	if (result.data.role !== 'owner' && result.data.role !== 'agent') {
		console.error('Cart token validation failed: invalid role', {
			role: result.data.role,
		});
		return { data: null, error: 'Invalid role' };
	}

	return result;
}

/**
 * Validate user WebSocket token
 */
async function validateUserToken(
	token: string,
	authSecret: string
): Promise<UserTokenValidationResult> {
	const result = await validateTokenPayload<UserTokenData>(token, authSecret);
	if (!result.data) {
		return result;
	}

	// Validate required fields for user token
	if (!result.data.userId || result.data.type !== 'user') {
		console.error('User token validation failed: missing required fields or wrong type', {
			hasUserId: !!result.data.userId,
			type: result.data.type,
		});
		return { data: null, error: 'Missing required fields' };
	}

	return result;
}

// Extended env interface for auth secret
interface ExtendedEnv extends CloudflareEnv {
	AUTH_SECRET?: string;
}

// Export custom fetch handler that intercepts WebSocket connections
export default {
	async fetch(
		request: Request,
		env: ExtendedEnv,
		ctx: ExecutionContext
	): Promise<Response> {
		const url = new URL(request.url);

		// Handle WebSocket upgrade requests to /api/ws/connect
		if (
			url.pathname === '/api/ws/connect' &&
			request.headers.get('Upgrade') === 'websocket'
		) {
			const token = url.searchParams.get('token');

			if (!token) {
				return new Response('Missing token', { status: 401 });
			}

			// Get AUTH_SECRET from environment
			const authSecret = env.AUTH_SECRET;
			if (!authSecret) {
				console.error('AUTH_SECRET not configured for WebSocket token validation');
				return new Response('Server configuration error', { status: 500 });
			}

			const { data: tokenData, error } = await validateConversationToken(token, authSecret);
			if (!tokenData) {
				return new Response(error || 'Invalid token', { status: 401 });
			}

			// Get the Durable Object for this conversation
			const doId = env.CONVERSATION_WS.idFromName(
				`conversation-${tokenData.conversationId}`
			);
			const stub = env.CONVERSATION_WS.get(doId);

			// Forward to DO with user info in query params
			const doUrl = new URL(request.url);
			doUrl.searchParams.set('userId', tokenData.userId.toString());
			doUrl.searchParams.set('conversationId', tokenData.conversationId.toString());

			return stub.fetch(doUrl.toString(), {
				headers: request.headers,
			});
		}

		// Handle WebSocket upgrade requests to /api/ws/cart-connect
		if (
			url.pathname === '/api/ws/cart-connect' &&
			request.headers.get('Upgrade') === 'websocket'
		) {
			const token = url.searchParams.get('token');

			if (!token) {
				return new Response('Missing token', { status: 401 });
			}

			// Get AUTH_SECRET from environment
			const authSecret = env.AUTH_SECRET;
			if (!authSecret) {
				console.error('AUTH_SECRET not configured for cart WebSocket token validation');
				return new Response('Server configuration error', { status: 500 });
			}

			const { data: tokenData, error } = await validateCartToken(token, authSecret);
			if (!tokenData) {
				return new Response(error || 'Invalid token', { status: 401 });
			}

			// Get the Durable Object for this user's cart
			const doId = env.CART_WS.idFromName(`cart-${tokenData.cartUserId}`);
			const stub = env.CART_WS.get(doId);

			// Forward to DO with user info in query params
			const doUrl = new URL(request.url);
			doUrl.searchParams.set('userId', tokenData.userId.toString());
			doUrl.searchParams.set('cartUserId', tokenData.cartUserId.toString());
			doUrl.searchParams.set('role', tokenData.role);

			return stub.fetch(doUrl.toString(), {
				headers: request.headers,
			});
		}

		// Handle WebSocket upgrade requests to /api/ws/user-connect
		if (
			url.pathname === '/api/ws/user-connect' &&
			request.headers.get('Upgrade') === 'websocket'
		) {
			const token = url.searchParams.get('token');

			if (!token) {
				return new Response('Missing token', { status: 401 });
			}

			// Get AUTH_SECRET from environment
			const authSecret = env.AUTH_SECRET;
			if (!authSecret) {
				console.error('AUTH_SECRET not configured for user WebSocket token validation');
				return new Response('Server configuration error', { status: 500 });
			}

			const { data: tokenData, error } = await validateUserToken(token, authSecret);
			if (!tokenData) {
				return new Response(error || 'Invalid token', { status: 401 });
			}

			// Get the Durable Object for this user
			const doId = env.USER_WS.idFromName(`user-${tokenData.userId}`);
			const stub = env.USER_WS.get(doId);

			// Forward to DO with user info in query params
			const doUrl = new URL(request.url);
			doUrl.searchParams.set('userId', tokenData.userId.toString());

			return stub.fetch(doUrl.toString(), {
				headers: request.headers,
			});
		}

		// All other requests go to OpenNext
		return openNextWorker.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<ExtendedEnv>;
