/**
 * Chat Functions Registry
 *
 * This file exports all available chat functions for GPT function calling.
 *
 * To add a new function:
 * 1. Create a new file in this folder (e.g., my-new-function.ts)
 * 2. Export a ChatFunction object with definition and handler
 * 3. Import and add it to the CHAT_FUNCTIONS array below
 *
 * Example:
 * ```typescript
 * import { myNewFunction } from './my-new-function';
 * const CHAT_FUNCTIONS: ChatFunction[] = [
 *   getCurrentUserInfo,
 *   myNewFunction,  // Add here
 * ];
 * ```
 */

import type { ChatFunction, FunctionContext, FunctionDefinition } from './types';
import { getCurrentUserInfo } from './get-current-user-info';
import { getPersonalInvoices } from './get-personal-invoices';
import { getOnlineEmployees } from './get-online-employees';
import { connectToAgent } from './connect-to-agent';

// Register all chat functions here
const CHAT_FUNCTIONS: ChatFunction[] = [
  getCurrentUserInfo,
  getPersonalInvoices,
  getOnlineEmployees,
  connectToAgent,
];

// Create a map for quick function lookup
const functionMap = new Map<string, ChatFunction>(
  CHAT_FUNCTIONS.map((fn) => [fn.definition.name, fn])
);

/**
 * Get all function definitions for OpenAI API
 */
export function getFunctionDefinitions(): FunctionDefinition[] {
  return CHAT_FUNCTIONS.map((fn) => fn.definition);
}

/**
 * Get a specific function by name
 */
export function getFunction(name: string): ChatFunction | undefined {
  return functionMap.get(name);
}

/**
 * Execute a function by name with given arguments
 */
export async function executeFunction(
  name: string,
  args: Record<string, unknown>,
  context: FunctionContext
): Promise<Record<string, unknown>> {
  const fn = functionMap.get(name);
  if (!fn) {
    return { error: `Unknown function: ${name}` };
  }
  try {
    return await fn.handler(args, context);
  } catch (error) {
    console.error(`Function ${name} execution failed:`, error);
    return {
      error: `Function execution failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Check if a function exists
 */
export function hasFunction(name: string): boolean {
  return functionMap.has(name);
}

/**
 * Get all function names
 */
export function getFunctionNames(): string[] {
  return Array.from(functionMap.keys());
}

// Re-export types
export type { ChatFunction, FunctionContext, FunctionDefinition } from './types';
