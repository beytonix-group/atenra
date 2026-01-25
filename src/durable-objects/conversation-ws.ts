import { DurableObject } from 'cloudflare:workers';

// Types for WebSocket messages
export interface NewMessagePayload {
	id: number;
	content: string;
	contentType: 'html' | 'json';
	createdAt: number;
	sender: {
		id: number;
		displayName: string;
		avatarUrl: string | null;
	};
}

interface SessionAttachment {
	userId: number;
	conversationId: number;
}

/**
 * Durable Object for managing WebSocket connections per conversation.
 * Uses the WebSocket Hibernation API for cost efficiency.
 */
export class ConversationWebSocket extends DurableObject<CloudflareEnv> {
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
					message: NewMessagePayload;
				};
				if (body.action === 'broadcast' && body.message) {
					await this.broadcastMessage(body.message);
					return new Response(JSON.stringify({ success: true }), {
						headers: { 'Content-Type': 'application/json' },
					});
				}
				return new Response('Invalid broadcast request', { status: 400 });
			} catch (e) {
				console.error('Error processing broadcast request:', e);
				return new Response('Internal error', { status: 500 });
			}
		}

		// Handle WebSocket upgrade requests
		const upgradeHeader = request.headers.get('Upgrade');
		if (upgradeHeader !== 'websocket') {
			return new Response('Expected WebSocket upgrade', { status: 426 });
		}

		// Extract user ID and conversation ID from query params (passed from upgrade route after auth)
		const userId = parseInt(url.searchParams.get('userId') || '0');
		const conversationId = parseInt(url.searchParams.get('conversationId') || '0');

		if (!userId || !conversationId) {
			return new Response('Unauthorized', { status: 401 });
		}

		// Create WebSocket pair
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		// Accept with hibernation API - this allows the DO to hibernate when idle
		this.ctx.acceptWebSocket(server);

		// Store session data that persists across hibernation
		const attachment: SessionAttachment = { userId, conversationId };
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
			console.error('WebSocket message dropped: attachment deserialization failed');
			return;
		}

		// Handle ArrayBuffer messages
		let messageStr: string;
		if (message instanceof ArrayBuffer) {
			try {
				messageStr = new TextDecoder().decode(message);
			} catch (decodeError) {
				console.error('WebSocket ArrayBuffer decode error:', {
					error: decodeError instanceof Error ? decodeError.message : String(decodeError),
					userId: attachment.userId,
					conversationId: attachment.conversationId,
				});
				return;
			}
		} else {
			messageStr = message;
		}

		// Parse message JSON separately from handling
		let data: { type?: string };
		try {
			data = JSON.parse(messageStr);
		} catch (parseError) {
			console.error('WebSocket message parse error:', {
				error: parseError instanceof Error ? parseError.message : String(parseError),
				userId: attachment.userId,
				conversationId: attachment.conversationId,
			});
			return;
		}

		// Handle message based on type
		try {
			switch (data.type) {
				case 'typing':
					this.broadcast(
						ws,
						JSON.stringify({
							type: 'typing',
							userId: attachment.userId,
							conversationId: attachment.conversationId,
						})
					);
					break;
				case 'read':
					this.broadcast(
						ws,
						JSON.stringify({
							type: 'read',
							userId: attachment.userId,
							conversationId: attachment.conversationId,
							timestamp: Date.now(),
						})
					);
					break;
				default:
					console.warn('Unknown WebSocket message type:', {
						type: data.type,
						userId: attachment.userId,
					});
					// Send error response for unknown message types
					try {
						ws.send(JSON.stringify({
							type: 'error',
							code: 'UNKNOWN_MESSAGE_TYPE',
							message: `Unknown message type: ${data.type}`,
						}));
					} catch {
						// Ignore send errors for error responses
					}
				// Ping/pong handled automatically by setWebSocketAutoResponse
			}
		} catch (handlingError) {
			console.error('WebSocket message handling error:', {
				type: data.type,
				error: handlingError instanceof Error ? handlingError.message : String(handlingError),
				userId: attachment.userId,
				conversationId: attachment.conversationId,
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
		console.log('WebSocket connection closed:', {
			code,
			reason: reason || 'none',
			wasClean,
			userId: attachment?.userId,
			conversationId: attachment?.conversationId,
		});
		// Connection cleanup is automatic with hibernation API
		ws.close(code, reason);
	}

	/**
	 * Called when there's an error with a WebSocket
	 */
	async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
		console.error('WebSocket error:', error);
	}

	/**
	 * Broadcast a new message to all connected participants.
	 * Called via RPC from the message POST API route.
	 */
	async broadcastMessage(message: NewMessagePayload): Promise<void> {
		const wsMessage = JSON.stringify({
			type: 'message',
			payload: message,
		});

		// Get all connected WebSockets (hibernation API provides this)
		const sockets = this.ctx.getWebSockets();

		for (const ws of sockets) {
			try {
				ws.send(wsMessage);
			} catch (e) {
				// WebSocket might be closed, will be cleaned up automatically
				console.error('Failed to send to WebSocket:', e);
			}
		}
	}

	/**
	 * Broadcast to all connected clients except the sender
	 */
	private broadcast(sender: WebSocket, message: string): void {
		const sockets = this.ctx.getWebSockets();

		for (const ws of sockets) {
			if (ws !== sender) {
				try {
					ws.send(message);
				} catch (e) {
					console.error('Failed to broadcast to WebSocket:', e);
				}
			}
		}
	}

	/**
	 * Get count of connected users (for debugging/monitoring)
	 */
	async getConnectionCount(): Promise<number> {
		return this.ctx.getWebSockets().length;
	}
}
