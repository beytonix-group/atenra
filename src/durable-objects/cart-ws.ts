import { DurableObject } from 'cloudflare:workers';
import type { CartWSMessage, CartBroadcastPayload, CartTokenData } from '@/lib/cart-websocket-types';

// Derive from CartTokenData, excluding the expiration field (only relevant during initial auth)
type SessionAttachment = Omit<CartTokenData, 'exp'>;

/**
 * Constant-time string comparison to prevent timing attacks.
 * Always performs the same number of operations regardless of where differences occur.
 * Returns true if strings are equal, false otherwise.
 */
function timingSafeCompare(a: string, b: string): boolean {
	// Use the longer length to ensure we always iterate the same amount
	const maxLen = Math.max(a.length, b.length);
	let result = a.length ^ b.length; // Non-zero if lengths differ

	for (let i = 0; i < maxLen; i++) {
		// Use 0 as fallback for out-of-bounds access (won't affect result since length already differs)
		const charA = i < a.length ? a.charCodeAt(i) : 0;
		const charB = i < b.length ? b.charCodeAt(i) : 0;
		result |= charA ^ charB;
	}

	return result === 0;
}

/**
 * Durable Object for managing WebSocket connections per user's cart.
 * Uses the WebSocket Hibernation API for cost efficiency.
 * One DO instance per user's cart (keyed by `cart-{userId}`).
 */
export class CartWebSocket extends DurableObject<CloudflareEnv> {
	constructor(ctx: DurableObjectState, env: CloudflareEnv) {
		super(ctx, env);
	}

	/**
	 * Handle incoming fetch requests (WebSocket upgrades and broadcast requests)
	 */
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// Handle broadcast requests from the API
		if (url.pathname === '/broadcast' && request.method === 'POST') {
				// Verify internal secret to prevent unauthorized broadcast calls
			const internalSecret = request.headers.get('X-Internal-Secret');
			const expectedSecret = this.env.INTERNAL_BROADCAST_SECRET;
			if (!internalSecret || !expectedSecret) {
				console.error('Cart broadcast endpoint unauthorized: missing internal secret');
				return new Response('Unauthorized', { status: 401 });
			}
			// Use constant-time comparison to prevent timing attacks
			if (!timingSafeCompare(internalSecret, expectedSecret)) {
				console.error('Cart broadcast endpoint unauthorized: invalid secret');
				return new Response('Unauthorized', { status: 401 });
			}

			try {
				const body = (await request.json()) as CartBroadcastPayload;
				if (body.action === 'broadcast' && body.event) {
					await this.broadcastEvent(body.event);
					return new Response(JSON.stringify({ success: true }), {
						headers: { 'Content-Type': 'application/json' },
					});
				}
				return new Response('Invalid broadcast request', { status: 400 });
			} catch (e) {
				console.error('Error processing cart broadcast request:', e);
				return new Response('Internal error', { status: 500 });
			}
		}

		// Handle WebSocket upgrade requests
		const upgradeHeader = request.headers.get('Upgrade');
		if (upgradeHeader !== 'websocket') {
			return new Response('Expected WebSocket upgrade', { status: 426 });
		}

		// Extract user ID, cart user ID, and role from query params (passed from worker after auth)
		const userId = parseInt(url.searchParams.get('userId') || '0');
		const cartUserId = parseInt(url.searchParams.get('cartUserId') || '0');
		const role = url.searchParams.get('role') as 'owner' | 'agent' | null;

		if (!userId || !cartUserId || !role) {
			return new Response('Unauthorized', { status: 401 });
		}

		// Create WebSocket pair
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		// Accept with hibernation API - this allows the DO to hibernate when idle
		this.ctx.acceptWebSocket(server);

		// Store session data that persists across hibernation
		const attachment: SessionAttachment = { userId, cartUserId, role };
		server.serializeAttachment(attachment);

		// Set up automatic ping/pong response for keep-alive
		this.ctx.setWebSocketAutoResponse(
			new WebSocketRequestResponsePair('{"type":"ping"}', '{"type":"pong"}')
		);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	/**
	 * Called when a WebSocket receives a message (after hibernation wake if needed)
	 */
	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
		const attachment = ws.deserializeAttachment() as SessionAttachment | null;
		if (!attachment) {
			console.error('Cart WebSocket message dropped: attachment deserialization failed');
			try {
				ws.send(JSON.stringify({
					type: 'error',
					error: 'Your session has expired. Please reconnect.',
					code: 'SESSION_EXPIRED',
					timestamp: Date.now(),
				}));
				ws.close(1008, 'Session expired');
			} catch (sendError) {
				// Connection may already be broken
				console.warn('Failed to send session expired error:', sendError instanceof Error ? sendError.message : String(sendError));
			}
			return;
		}

			// Handle ArrayBuffer messages
		let messageStr: string;
		if (message instanceof ArrayBuffer) {
			try {
				messageStr = new TextDecoder().decode(message);
			} catch (decodeError) {
				console.error('Cart WebSocket ArrayBuffer decode error:', {
					error: decodeError instanceof Error ? decodeError.message : String(decodeError),
					userId: attachment.userId,
					cartUserId: attachment.cartUserId,
				});
				try {
					ws.send(JSON.stringify({
						type: 'error',
						error: 'Message could not be decoded',
						code: 'DECODE_ERROR',
						timestamp: Date.now(),
					}));
				} catch (sendError) {
					console.warn('Failed to send decode error response:', sendError instanceof Error ? sendError.message : String(sendError));
				}
				return;
			}
			} else {
			messageStr = message;
		}

		// Parse message JSON
		let data: { type?: string };
		try {
			data = JSON.parse(messageStr);
		} catch (parseError) {
			console.error('Cart WebSocket message parse error:', {
				error: parseError instanceof Error ? parseError.message : String(parseError),
				userId: attachment.userId,
				cartUserId: attachment.cartUserId,
			});
			try {
				ws.send(JSON.stringify({
					type: 'error',
					error: 'Message could not be parsed as JSON',
					code: 'INVALID_JSON',
					timestamp: Date.now(),
				}));
			} catch (sendError) {
				console.warn('Failed to send JSON parse error response:', sendError instanceof Error ? sendError.message : String(sendError));
			}
			return;
		}

		// Handle message based on type
		// Currently cart WebSocket is notification-only, clients don't send meaningful messages
		// except ping/pong which is handled automatically
		if (data.type && data.type !== 'ping' && data.type !== 'pong') {
			console.warn('Unknown cart WebSocket message type:', {
				type: data.type,
				userId: attachment.userId,
			});
		}
	}

	/**
	 * Called when a WebSocket connection is closed
	 */
	async webSocketClose(
		ws: WebSocket,
		code: number,
		reason: string,
		wasClean: boolean
	): Promise<void> {
		const attachment = ws.deserializeAttachment() as SessionAttachment | null;
		console.log('Cart WebSocket connection closed:', {
			code,
			reason: reason || 'none',
			wasClean,
			userId: attachment?.userId,
			cartUserId: attachment?.cartUserId,
			role: attachment?.role,
		});
		// Connection cleanup is automatic with hibernation API - no need to call ws.close()
	}

	/**
	 * Called when there's an error with a WebSocket
	 */
	async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
		const attachment = ws.deserializeAttachment() as SessionAttachment | null;
		console.error('Cart WebSocket error:', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
			userId: attachment?.userId,
			cartUserId: attachment?.cartUserId,
			role: attachment?.role,
		});
	}

	/**
	 * Broadcast a cart event to all connected clients.
	 * Called via POST /broadcast from the cart API routes.
	 */
	async broadcastEvent(event: CartWSMessage): Promise<void> {
		const wsMessage = JSON.stringify(event);

			// Get all connected WebSockets (hibernation API provides this)
		const sockets = this.ctx.getWebSockets();

		for (const ws of sockets) {
			try {
				ws.send(wsMessage);
			} catch (e) {
				// WebSocket might be closed, will be cleaned up automatically
				const attachment = ws.deserializeAttachment() as SessionAttachment | null;
				console.error('Failed to send to cart WebSocket:', {
					error: e instanceof Error ? e.message : String(e),
					userId: attachment?.userId,
					cartUserId: attachment?.cartUserId,
					eventType: event.type,
				});
			}
		}
	}

	/**
	 * Get count of connected clients (for debugging/monitoring)
	 */
	async getConnectionCount(): Promise<number> {
		return this.ctx.getWebSockets().length;
	}
}
