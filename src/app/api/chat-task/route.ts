import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import {
  getFunctionDefinitions,
  executeFunction,
  hasFunction,
} from '@/lib/chat-functions';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  includeUserContext?: boolean;
  autoConnect?: boolean;
}

interface FunctionCall {
  name: string;
  arguments: string;
}

interface OpenAIMessageWithFunctionCall {
  role: string;
  content: string | null;
  function_call?: FunctionCall;
}

interface OpenAIResponse {
  choices?: Array<{
    message?: OpenAIMessageWithFunctionCall;
    finish_reason?: string;
    index?: number;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}

// Response type for auto-connect flow
interface _AutoConnectResponse {
  messages: Array<{ role: 'assistant'; content: string }>;
  redirect?: {
    url: string;
    agentName: string;
    conversationId: number;
  };
  noAgentsAvailable: boolean;
}

// Task-focused system prompt for regular users
const TASK_SYSTEM_PROMPT = `You are the Atenra Task Assistant, a friendly guide helping users accomplish tasks on the Atenra platform.

YOUR ROLE:
You are here to help regular users navigate the platform and complete their goals. Be proactive, helpful, and guide them step-by-step.

WHAT YOU CAN HELP WITH:
1. Finding and booking home services (cleaning, plumbing, electrical, etc.)
2. Understanding what services are available
3. Navigating to the Messages page to communicate with service providers
4. Managing their profile and account settings
5. Understanding subscription options and billing
6. Getting help and support

HOW TO INTERACT:
- Be warm, friendly, and conversational
- Ask clarifying questions to understand what the user wants to accomplish
- Guide them step-by-step through tasks
- Be proactive in suggesting next actions
- Keep responses concise and actionable
- If they want to browse services, guide them to explore options through conversation

IMPORTANT RESTRICTIONS:
1. You can ONLY discuss the Atenra platform and home services
2. You MUST NOT reveal information about other users
3. If asked about unrelated topics, politely redirect to Atenra-related topics
4. Always be helpful and never dismissive

AVAILABLE NAVIGATION:
- Messages page (/messages) - for communicating with service providers
- Profile (/profile) - to manage their account
- Billing (/billing) - to view subscription and payment info
- Help & Support (/support) - for additional assistance

When greeting the user, use their name if available and ask what they'd like to accomplish today.`;

// Auto-connect system prompt - instructs GPT to greet and connect to agent automatically
const AUTO_CONNECT_SYSTEM_PROMPT = `You are the Atenra Assistant. Your job is to greet the user and connect them with an available agent.

IMPORTANT: You MUST follow these steps in order. Do not ask questions or deviate from this flow.

STEP 1: Call the get_current_user_info function to get the user's name and information.

STEP 2: After receiving the user info, greet them with EXACTLY this format (use their actual name):
"Hello [firstName] [lastName], how's your day? Let me connect you with an agent."

If the user has no name, use: "Hello there, how's your day? Let me connect you with an agent."

STEP 3: Immediately call the connect_to_agent function to find and connect them with an available online agent.

STEP 4: Based on the connect_to_agent result:
- If successful: Say "Great! Connecting you with [agentName] now..."
- If no agents available: Say "I'm sorry, all agents are currently offline. Please try again at a later time."

CRITICAL RULES:
- Do NOT ask the user any questions
- Do NOT wait for user input between steps
- Proceed through ALL steps automatically
- Keep messages brief and friendly`;

// Timeout for OpenAI API calls (30 seconds)
const OPENAI_TIMEOUT_MS = 30000;

// Helper to fetch user info for personalized greeting
async function getUserInfoForGreeting(authUserId: string): Promise<string | null> {
  try {
    const user = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        displayName: users.displayName,
        city: users.city,
        state: users.state,
      })
      .from(users)
      .where(eq(users.authUserId, authUserId))
      .get();

    if (!user) return null;

    const name = user.displayName ||
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      'there';

    const location = [user.city, user.state].filter(Boolean).join(', ');

    return `User's name: ${name}${location ? `, Location: ${location}` : ''}`;
  } catch (error) {
    console.error('Error fetching user info for greeting:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Chat service not configured' },
        { status: 500 }
      );
    }

    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let body: ChatRequest;
    try {
      body = await request.json() as ChatRequest;
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { messages, includeUserContext, autoConnect } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Check if this is a greeting request (first open, no messages)
    const isGreetingRequest = includeUserContext && messages.length === 0;

    // For greeting requests, use optimized flow
    if (isGreetingRequest) {
      const userInfo = await getUserInfoForGreeting(session.user.id);

      const greetingSystemPrompt = `${TASK_SYSTEM_PROMPT}

Current user context: ${userInfo || 'User information not available'}

Please greet this user warmly by name and ask what they need help with today. Be friendly and inviting. Keep it to 2-3 sentences max. End with a clear question like "What can I help you with?" or "How can I assist you today?"`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

      try {
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: greetingSystemPrompt },
              { role: 'user', content: 'Please greet me and ask what I want to do.' },
            ],
            temperature: 0.8,
            max_tokens: 200,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!openaiRes.ok) {
          const error = await openaiRes.text();
          console.error('OpenAI API error (greeting):', error);
          return NextResponse.json(
            { error: 'Failed to get greeting' },
            { status: openaiRes.status }
          );
        }

        const completion = await openaiRes.json() as OpenAIResponse;

        // Defensive validation of OpenAI response
        if (!completion?.choices?.length || !completion.choices[0]?.message?.content) {
          console.error('Invalid OpenAI greeting response:', {
            hasChoices: !!completion?.choices,
            choicesLength: completion?.choices?.length,
            error: completion?.error,
          });
          return NextResponse.json(
            { error: 'Unable to get greeting. Please try again.' },
            { status: 502 }
          );
        }

        const greetingMessage = completion.choices[0].message.content;

        return NextResponse.json({
          message: greetingMessage,
          usage: completion.usage,
        });
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Request timed out' },
            { status: 504 }
          );
        }
        throw error;
      }
    }

    // Auto-connect flow - greet user and connect to agent automatically
    if (autoConnect) {
      const collectedMessages: Array<{ role: 'assistant'; content: string }> = [];
      let redirectInfo: { url: string; agentName: string; conversationId: number } | undefined;
      let noAgentsAvailable = false;

      // Get function definitions for auto-connect (only need get_current_user_info and connect_to_agent)
      const allFunctions = getFunctionDefinitions();
      const autoConnectFunctions = allFunctions.filter(
        (fn) => fn.name === 'get_current_user_info' || fn.name === 'connect_to_agent'
      );

      // Build initial messages for GPT
      type GPTMessage = { role: 'system' | 'user' | 'assistant' | 'function'; content: string | null; function_call?: FunctionCall; name?: string };
      const gptMessages: GPTMessage[] = [
        { role: 'system', content: AUTO_CONNECT_SYSTEM_PROMPT },
        { role: 'user', content: 'Please greet me and connect me with an agent.' },
      ];

      // Function calling loop - max 5 iterations to prevent infinite loops
      const MAX_ITERATIONS = 5;
      for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

        let openaiRes: Response;
        try {
          openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: gptMessages,
              temperature: 0.7,
              max_tokens: 500,
              functions: autoConnectFunctions,
              function_call: 'auto',
            }),
            signal: controller.signal,
          });
        } catch (error) {
          clearTimeout(timeoutId);
          if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json(
              { error: 'Request timed out' },
              { status: 504 }
            );
          }
          throw error;
        } finally {
          clearTimeout(timeoutId);
        }

        if (!openaiRes.ok) {
          const errorText = await openaiRes.text();
          console.error('OpenAI API error (auto-connect):', errorText);
          return NextResponse.json(
            { error: 'Failed to get response from OpenAI' },
            { status: openaiRes.status }
          );
        }

        const completion = await openaiRes.json() as OpenAIResponse;

        // Defensive validation of OpenAI response structure
        if (!completion?.choices?.length || !completion.choices[0]?.message) {
          console.error('Invalid OpenAI response structure:', {
            hasChoices: !!completion?.choices,
            choicesLength: completion?.choices?.length,
            error: completion?.error,
          });
          return NextResponse.json(
            { error: 'Received an unexpected response. Please try again.' },
            { status: 502 }
          );
        }

        const assistantMessage = completion.choices[0].message;

        // Check if GPT wants to call a function
        if (assistantMessage.function_call) {
          const functionName = assistantMessage.function_call.name;
          console.log('[auto-connect] GPT calling function:', functionName);

          // Add assistant message with function call to history
          gptMessages.push({
            role: 'assistant',
            content: assistantMessage.content,
            function_call: assistantMessage.function_call,
          });

          if (hasFunction(functionName)) {
            // Parse function arguments
            let functionArgs: Record<string, unknown> = {};
            try {
              functionArgs = JSON.parse(assistantMessage.function_call.arguments || '{}');
            } catch (parseError) {
              console.error('Failed to parse function arguments:', parseError);
              functionArgs = {};
            }

            // Execute the function
            const functionResult = await executeFunction(
              functionName,
              functionArgs,
              {
                authUserId: session.user.id,
                sessionUser: {
                  id: session.user.id,
                  name: session.user.name,
                  email: session.user.email,
                  image: session.user.image,
                },
              }
            );

            // Log function completion without sensitive data
            console.log('[auto-connect] Function completed:', functionName, {
              success: (functionResult as { success?: boolean }).success,
            });

            // Check if connect_to_agent returned redirect info
            if (functionName === 'connect_to_agent') {
              const result = functionResult as {
                success?: boolean;
                agentName?: string;
                conversationId?: number;
                redirectUrl?: string;
                noAgentsAvailable?: boolean;
              };

              if (result.success && result.redirectUrl && result.agentName && result.conversationId) {
                redirectInfo = {
                  url: result.redirectUrl,
                  agentName: result.agentName,
                  conversationId: result.conversationId,
                };
              } else if (result.noAgentsAvailable) {
                noAgentsAvailable = true;
              }
            }

            // Add function result to history
            gptMessages.push({
              role: 'function',
              name: functionName,
              content: JSON.stringify(functionResult),
            });
          } else {
            // Unknown function
            gptMessages.push({
              role: 'function',
              name: functionName,
              content: JSON.stringify({ error: `Unknown function: ${functionName}` }),
            });
          }

          // Continue to next iteration to get GPT's response to the function result
          continue;
        }

        // GPT returned a text message (no function call)
        if (assistantMessage.content) {
          collectedMessages.push({
            role: 'assistant',
            content: assistantMessage.content,
          });
        }

        // Check if we should continue or stop
        const finishReason = completion.choices[0]?.finish_reason;
        if (finishReason === 'stop' || !assistantMessage.function_call) {
          // GPT is done, break out of the loop
          break;
        }
      }

      // Return the auto-connect response
      return NextResponse.json({
        messages: collectedMessages,
        redirect: redirectInfo,
        noAgentsAvailable,
      });
    }

    // Regular chat flow (no function calling - simpler for task guidance)
    const messagesWithSystem: ChatMessage[] = [
      { role: 'system', content: TASK_SYSTEM_PROMPT },
      ...messages,
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

    let openaiRes: Response;
    try {
      openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messagesWithSystem,
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out' },
          { status: 504 }
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!openaiRes.ok) {
      const error = await openaiRes.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from OpenAI' },
        { status: openaiRes.status }
      );
    }

    const completion = await openaiRes.json() as OpenAIResponse;

    // Defensive validation of OpenAI response
    if (!completion?.choices?.length || !completion.choices[0]?.message?.content) {
      console.error('Invalid OpenAI chat response:', {
        hasChoices: !!completion?.choices,
        choicesLength: completion?.choices?.length,
        error: completion?.error,
      });
      return NextResponse.json(
        { error: 'Unable to get response. Please try again.' },
        { status: 502 }
      );
    }

    const assistantMessage = completion.choices[0].message;

    return NextResponse.json({
      message: assistantMessage.content,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Chat Task API error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
