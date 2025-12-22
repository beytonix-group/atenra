/**
 * Types for GPT function calling in chat
 *
 * To add a new function:
 * 1. Create a new file in /src/lib/chat-functions/
 * 2. Export a ChatFunction object with definition and handler
 * 3. Add it to the registry in index.ts
 */

export interface FunctionParameter {
  type: string;
  description?: string;
  enum?: string[];
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, FunctionParameter>;
    required: string[];
  };
}

export interface FunctionContext {
  authUserId: string;
  sessionUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export type FunctionHandler = (
  args: Record<string, unknown>,
  context: FunctionContext
) => Promise<Record<string, unknown>>;

export interface ChatFunction {
  definition: FunctionDefinition;
  handler: FunctionHandler;
}
