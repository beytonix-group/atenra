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

// Export our custom Durable Object for WebSocket conversations
export { ConversationWebSocket } from './src/durable-objects/conversation-ws';

interface TokenData {
	userId: number;
	conversationId: number;
	exp: number;
}

interface TokenValidationResult {
	data: TokenData | null;
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
 * Validate and decode the WebSocket token.
 * Token format: base64url(payload).base64url(signature)
 * Returns result object with data or error details.
 */
async function validateToken(
	token: string,
	authSecret: string
): Promise<TokenValidationResult> {
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
	let decoded: TokenData;
	try {
		decoded = JSON.parse(
			Buffer.from(payload, 'base64url').toString('utf-8')
		) as TokenData;
	} catch (e) {
		console.error('Token validation failed: payload decode/parse error', {
			error: e instanceof Error ? e.message : String(e),
		});
		return { data: null, error: 'Invalid payload' };
	}

	// Check expiry
	const now = Math.floor(Date.now() / 1000);
	if (decoded.exp < now) {
		console.warn('Token validation failed: token expired', {
			expiredAt: decoded.exp,
			now,
			expiredSecondsAgo: now - decoded.exp,
		});
		return { data: null, error: 'Token expired' };
	}

	// Validate required fields
	if (!decoded.userId || !decoded.conversationId) {
		console.error('Token validation failed: missing required fields', {
			hasUserId: !!decoded.userId,
			hasConversationId: !!decoded.conversationId,
		});
		return { data: null, error: 'Missing required fields' };
	}

	return { data: decoded, error: null };
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

			const { data: tokenData, error } = await validateToken(token, authSecret);
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

		// All other requests go to OpenNext
		return openNextWorker.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<ExtendedEnv>;
