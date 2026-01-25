import type { ConversationWebSocket } from './src/durable-objects/conversation-ws';

declare global {
	namespace NodeJS {
		interface ProcessEnv extends CloudflareEnv {}
	}
}

// Extend CloudflareEnv with typed Durable Object stub
declare global {
	interface CloudflareEnv {
		CONVERSATION_WS: DurableObjectNamespace<ConversationWebSocket>;
	}
}

export type {};