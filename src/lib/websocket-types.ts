/**
 * WebSocket message types shared between client and server.
 * Used for type-safe WebSocket communication in the messaging system.
 */

export type WSMessageType =
	| 'message'
	| 'typing'
	| 'read'
	| 'presence'
	| 'ping'
	| 'pong'
	| 'error';

export interface WSBaseMessage {
	type: WSMessageType;
	conversationId?: number;
	timestamp?: number;
}

/** Server -> Client: New message received */
export interface WSNewMessage extends WSBaseMessage {
	type: 'message';
	payload: {
		id: number;
		content: string;
		contentType: 'html' | 'json';
		createdAt: number;
		sender: {
			id: number;
			displayName: string;
			avatarUrl: string | null;
		};
	};
}

/** Client -> Server or Server -> Client: User is typing */
export interface WSTypingMessage extends WSBaseMessage {
	type: 'typing';
	userId: number;
	conversationId: number;
}

/** Client -> Server or Server -> Client: User read messages */
export interface WSReadMessage extends WSBaseMessage {
	type: 'read';
	userId: number;
	conversationId: number;
	timestamp: number;
}

/** Server -> Client: User presence update */
export interface WSPresenceMessage extends WSBaseMessage {
	type: 'presence';
	userId: number;
	isOnline: boolean;
}

/** Keep-alive ping/pong */
export interface WSPingPong extends WSBaseMessage {
	type: 'ping' | 'pong';
}

/** Server -> Client: Error notification */
export interface WSErrorMessage extends WSBaseMessage {
	type: 'error';
	error: string;
	code?: number;
}

/** Union type for all WebSocket messages */
export type WSMessage =
	| WSNewMessage
	| WSTypingMessage
	| WSReadMessage
	| WSPresenceMessage
	| WSPingPong
	| WSErrorMessage;

/** Type guard for new message */
export function isNewMessage(msg: WSMessage): msg is WSNewMessage {
	return msg.type === 'message';
}

/** Type guard for typing message */
export function isTypingMessage(msg: WSMessage): msg is WSTypingMessage {
	return msg.type === 'typing';
}

/** Type guard for read message */
export function isReadMessage(msg: WSMessage): msg is WSReadMessage {
	return msg.type === 'read';
}
