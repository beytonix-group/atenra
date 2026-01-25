import { DurableObject } from 'cloudflare:workers';

interface SessionAttachment {
	userId: number;
}

/**
 * Durable Object for managing user-level WebSocket connections.
 * Keyed by `user-{userId}`. Handles global notifications like unread count updates.
 * Uses the WebSocket Hibernation API for cost efficiency.
 */
export class UserWebSocket extends DurableObject<CloudflareEnv> {
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
			try {
				const body = (await request.json()) as {
					action: string;
					type: string;
					count?: number;
				};
				if (body.action === 'broadcast' && body.type === 'unread_count_changed' && typeof body.count === 'number') {
					await this.broadcastUnreadCountChange(body.count);
					return new Response(JSON.stringify({ success: true }), {
						headers: { 'Content-Type': 'application/json' },
					});
				}
				return new Response('Invalid broadcast request', { status: 400 });
			} catch (e) {
				console.error('Error processing user broadcast request:', e);
				return new Response('Internal error', { status: 500 });
			}
		}

		// Handle WebSocket upgrade requests
		const upgradeHeader = request.headers.get('Upgrade');
		if (upgradeHeader !== 'websocket') {
			return new Response('Expected WebSocket upgrade', { status: 426 });
		}

		// Extract user ID from query params (passed from upgrade route after auth)
		const userId = parseInt(url.searchParams.get('userId') || '0');

		if (!userId) {
			return new Response('Unauthorized', { status: 401 });
		}

		// Create WebSocket pair
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		// Accept with hibernation API - this allows the DO to hibernate when idle
		this.ctx.acceptWebSocket(server);

		// Store session data that persists across hibernation
		const attachment: SessionAttachment = { userId };
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
			console.error('User WebSocket message dropped: attachment deserialization failed');
			return;
		}

		// Handle ArrayBuffer messages
		let messageStr: string;
		if (message instanceof ArrayBuffer) {
			try {
				messageStr = new TextDecoder().decode(message);
			} catch (decodeError) {
				console.error('User WebSocket ArrayBuffer decode error:', {
					error: decodeError instanceof Error ? decodeError.message : String(decodeError),
					userId: attachment.userId,
				});
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
			console.error('User WebSocket message parse error:', {
				error: parseError instanceof Error ? parseError.message : String(parseError),
				userId: attachment.userId,
			});
			return;
		}

		// Handle message based on type
		try {
			switch (data.type) {
				case 'ping':
					// Handled automatically by setWebSocketAutoResponse, but handle manual pings too
					try {
						ws.send(JSON.stringify({ type: 'pong' }));
					} catch {
						// Ignore send errors
					}
					break;
				default:
					// User WebSocket currently only receives broadcasts, not client messages
					console.warn('Unknown User WebSocket message type:', {
						type: data.type,
						userId: attachment.userId,
					});
			}
		} catch (handlingError) {
			console.error('User WebSocket message handling error:', {
				type: data.type,
				error: handlingError instanceof Error ? handlingError.message : String(handlingError),
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
		console.log('User WebSocket connection closed:', {
			code,
			reason: reason || 'none',
			wasClean,
			userId: attachment?.userId,
		});
		// Connection cleanup is automatic with hibernation API
		ws.close(code, reason);
	}

	/**
	 * Called when there's an error with a WebSocket
	 */
	async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
		console.error('User WebSocket error:', error);
	}

	/**
	 * Broadcast unread count change to all connected clients for this user.
	 * Called via HTTP from the message/read API routes.
	 */
	async broadcastUnreadCountChange(count: number): Promise<void> {
		const wsMessage = JSON.stringify({
			type: 'unread_count_changed',
			count,
			timestamp: Date.now(),
		});

		// Get all connected WebSockets (hibernation API provides this)
		const sockets = this.ctx.getWebSockets();

		for (const ws of sockets) {
			try {
				ws.send(wsMessage);
			} catch (e) {
				// WebSocket might be closed, will be cleaned up automatically
				console.error('Failed to send to User WebSocket:', e);
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
