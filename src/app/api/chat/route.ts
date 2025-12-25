import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import {
  getFunctionDefinitions,
  executeFunction,
  hasFunction,
} from '@/lib/chat-functions';
import { db } from '@/server/db';
import { users, companyUsers, companies } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { isSuperAdmin } from '@/lib/auth-helpers';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  includeUserContext?: boolean;
}

interface FunctionCall {
  name: string;
  arguments: string;
}

interface OpenAIMessage {
  role: string;
  content: string | null;
  function_call?: FunctionCall;
}

interface OpenAIResponse {
  choices: Array<{
    message: OpenAIMessage;
    finish_reason: string;
    index: number;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// System prompt to restrict conversation scope
const SYSTEM_PROMPT = `You are Atenra AI Assistant, a helpful assistant for the Atenra platform - a marketplace for home services.

IMPORTANT RESTRICTIONS:
1. You can ONLY discuss topics related to the Atenra platform, its features, and home services.
2. You MUST NOT reveal any information about other users, their personal data, or their activities.
3. You MUST NOT make external API calls or access external systems.
4. You MUST NOT discuss or provide information about topics unrelated to Atenra or home services.
5. You MUST NOT execute any code or scripts.
6. You can ONLY access the current user's own profile information when they ask about their account.
7. If asked about other users or external topics, politely decline and redirect to Atenra-related topics.

You can help users with:
- Understanding how to use the Atenra marketplace
- Finding and booking home services
- Managing their account and profile
- Understanding their subscription and billing
- Company dashboard features (for business owners)
- General questions about home services
- Troubleshooting platform issues

FORMATTING GUIDELINES:
- Keep responses concise and scannable
- For invoice/billing data, use a clean table-like format without markdown bullets or bold:
  Example:
  Invoice #INV-001
  Customer: John Doe
  Amount: $500.00 | Paid: $0.00 | Balance: $500.00
  Status: Sent | Due: 12/25/2025
- Use line breaks to separate sections, not bullet points
- Avoid excessive markdown formatting (**, -, etc.)
- For multiple invoices, show a brief summary then list each compactly

When greeting the user, use their name if available and be friendly but professional.`;

// Timeout for OpenAI API calls (30 seconds)
const OPENAI_TIMEOUT_MS = 30000;

// Helper to fetch user info for personalized greeting (fast, no function calling needed)
async function getUserInfoForGreeting(authUserId: string): Promise<string | null> {
  try {
    const user = await db
      .select({
        id: users.id,
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

    let role = 'user';
    const isAdmin = await isSuperAdmin().catch(() => false);
    if (isAdmin) {
      role = 'Platform Administrator';
    } else {
      const companyRole = await db
        .select({ companyName: companies.name, role: companyUsers.role })
        .from(companyUsers)
        .innerJoin(companies, eq(companyUsers.companyId, companies.id))
        .where(eq(companyUsers.userId, user.id))
        .get();
      if (companyRole) {
        role = `${companyRole.role} at ${companyRole.companyName}`;
      }
    }

    return `User's name: ${name}${location ? `, Location: ${location}` : ''}${role !== 'user' ? `, Role: ${role}` : ''}`;
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

    const { messages, includeUserContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Check if this is a greeting request (first open, no messages)
    const isGreetingRequest = includeUserContext && messages.length === 0;

    // For greeting requests, use optimized flow without function calling
    if (isGreetingRequest) {
      const userInfo = await getUserInfoForGreeting(session.user.id);

      const greetingSystemPrompt = `${SYSTEM_PROMPT}

Current user context: ${userInfo || 'User information not available'}

Please greet this user warmly and personally. Keep it brief and friendly.`;

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
              { role: 'user', content: 'Please greet me.' },
            ],
            temperature: 0.7,
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
        const greetingMessage = completion.choices[0]?.message?.content;

        if (!greetingMessage) {
          return NextResponse.json(
            { error: 'No greeting received' },
            { status: 500 }
          );
        }

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

    // Regular chat flow with function calling
    const messagesWithSystem: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Get function definitions from the registry
    const functions = getFunctionDefinitions();

    console.log('[chat] Function count:', functions.length);
    console.log('[chat] Available functions:', functions.map(f => f.name));
    console.log('[chat] Message count:', messages.length);

    // Call OpenAI API with function calling
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
          max_tokens: 1000,
          functions: functions.length > 0 ? functions : undefined,
          function_call: functions.length > 0 ? 'auto' : undefined,
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

    let completion = await openaiRes.json() as OpenAIResponse;
    let assistantMessage = completion.choices[0]?.message;

    console.log('[chat] GPT response:', {
      hasContent: !!assistantMessage?.content,
      hasFunctionCall: !!assistantMessage?.function_call,
      functionName: assistantMessage?.function_call?.name,
      finishReason: completion.choices[0]?.finish_reason,
    });

    // Handle function call if GPT wants to call a function
    if (assistantMessage?.function_call) {
      const functionName = assistantMessage.function_call.name;

      if (hasFunction(functionName)) {
        // Parse function arguments
        let functionArgs: Record<string, unknown> = {};
        try {
          functionArgs = JSON.parse(assistantMessage.function_call.arguments || '{}');
        } catch (error) {
          console.error('Failed to parse function arguments:', error);
          return NextResponse.json(
            { error: 'Invalid function arguments from AI' },
            { status: 500 }
          );
        }

        // Execute the function from registry
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

        // Send function result back to GPT
        const functionResultMessages = [
          ...messagesWithSystem,
          {
            role: 'assistant' as const,
            content: null,
            function_call: assistantMessage.function_call,
          },
          {
            role: 'function' as const,
            name: functionName,
            content: JSON.stringify(functionResult),
          },
        ];

        // Get final response from GPT with timeout
        const followUpController = new AbortController();
        const followUpTimeoutId = setTimeout(() => followUpController.abort(), OPENAI_TIMEOUT_MS);

        let followUpRes: Response;
        try {
          followUpRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: functionResultMessages,
              temperature: 0.7,
              max_tokens: 1000,
            }),
            signal: followUpController.signal,
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
          clearTimeout(followUpTimeoutId);
        }

        if (!followUpRes.ok) {
          const error = await followUpRes.text();
          console.error('OpenAI API follow-up error:', error);
          return NextResponse.json(
            { error: 'Failed to get response from OpenAI' },
            { status: followUpRes.status }
          );
        }

        completion = await followUpRes.json() as OpenAIResponse;
        assistantMessage = completion.choices[0]?.message;
      }
    }

    if (!assistantMessage || !assistantMessage.content) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: assistantMessage.content,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);

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
