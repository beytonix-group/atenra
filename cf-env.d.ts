import type { ConversationWebSocket } from './src/durable-objects/conversation-ws';
import type { CartWebSocket } from './src/durable-objects/cart-ws';

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
	}
}

export type {};