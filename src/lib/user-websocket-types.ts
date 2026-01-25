/**
 * WebSocket message types for user-level WebSocket connections.
 * Used for global notifications like unread count updates.
 */

export type UserWSMessageType =
	| 'unread_count_changed'
	| 'ping'
	| 'pong'
	| 'error';

export interface UserWSBaseMessage {
	type: UserWSMessageType;
	timestamp?: number;
}

/** Server -> Client: Unread message count has changed */
export interface UserWSUnreadCountChanged extends UserWSBaseMessage {
	type: 'unread_count_changed';
	count: number;
	timestamp: number;
}

/** Keep-alive ping/pong */
export interface UserWSPingPong extends UserWSBaseMessage {
	type: 'ping' | 'pong';
}

/** Server -> Client: Error notification */
export interface UserWSErrorMessage extends UserWSBaseMessage {
	type: 'error';
	error: string;
	code?: string;
}

/** Union type for all User WebSocket messages */
export type UserWSMessage =
	| UserWSUnreadCountChanged
	| UserWSPingPong
	| UserWSErrorMessage;

/** Type guard for unread count changed message */
export function isUnreadCountChanged(msg: UserWSMessage): msg is UserWSUnreadCountChanged {
	return msg.type === 'unread_count_changed';
}
