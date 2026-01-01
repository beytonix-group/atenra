import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  includeUserContext?: boolean;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string | null;
    };
    finish_reason: string;
    index: number;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
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

    const { messages, includeUserContext } = body;

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

Please greet this user warmly by name and ask what they would like to accomplish today. Be friendly and inviting. Keep it brief - 2-3 sentences max.`;

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
    const assistantMessage = completion.choices[0]?.message;

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
