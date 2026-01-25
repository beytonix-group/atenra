import type { ConversationWebSocket } from './src/durable-objects/conversation-ws';
import type { CartWebSocket } from './src/durable-objects/cart-ws';
import type { UserWebSocket } from './src/durable-objects/user-ws';

declare global {
	namespace NodeJS {
		interface ProcessEnv extends CloudflareEnv {}
	}
}

// Extend CloudflareEnv with typed Durable Object stubs
declare global {
	interface CloudflareEnv {
		CONVERSATION_WS: DurableObjectNamespace<ConversationWebSocket>;
		CART_WS: DurableObjectNamespace<CartWebSocket>;
		USER_WS: DurableObjectNamespace<UserWebSocket>;
	}
}

export type {};