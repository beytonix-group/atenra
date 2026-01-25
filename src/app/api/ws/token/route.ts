import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { db } from '@/server/db';
import { conversationParticipants } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Generate a cryptographically signed WebSocket authentication token.
 * Token format: base64url(payload).base64url(signature)
 *
 * This endpoint validates:
 * 1. User is authenticated
 * 2. For conversation tokens: User is a participant in the requested conversation
 *
 * GET /api/ws/token?conversationId=123    - Conversation WebSocket token
 * GET /api/ws/token?type=user             - User-level WebSocket token (for global notifications)
 */

/**
 * Create HMAC-SHA256 signature using Web Crypto API (works in Cloudflare Workers)
 */
async function createSignature(payload: string, secret: string): Promise<string> {
	const encoder = new TextEncoder();
	const keyData = encoder.encode(secret);
	const messageData = encoder.encode(payload);

	const key = await crypto.subtle.importKey(
		'raw',
		keyData,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);

	const signature = await crypto.subtle.sign('HMAC', key, messageData);
	return btoa(String.fromCharCode(...new Uint8Array(signature)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}
export async function GET(request: NextRequest) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const tokenType = searchParams.get('type');
		const conversationIdParam = searchParams.get('conversationId');

		// Sign the token with AUTH_SECRET using HMAC-SHA256
		const authSecret = process.env.AUTH_SECRET;
		if (!authSecret) {
			console.error('AUTH_SECRET not configured for WebSocket token signing');
			return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
		}

		// Handle user-level WebSocket token (for global notifications)
		if (tokenType === 'user') {
			const tokenData = {
				userId: currentUser.id,
				type: 'user' as const,
				exp: Math.floor(Date.now() / 1000) + 60, // 60 seconds expiry
			};

			const payload = Buffer.from(JSON.stringify(tokenData)).toString('base64url');
			const signature = await createSignature(payload, authSecret);
			const token = `${payload}.${signature}`;

			return NextResponse.json({ token });
		}

		// Handle conversation WebSocket token (default behavior)
		if (!conversationIdParam) {
			return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
		}

		const conversationId = parseInt(conversationIdParam);
		if (isNaN(conversationId)) {
			return NextResponse.json({ error: 'Invalid conversationId' }, { status: 400 });
		}

		// Verify user is a participant
		const participation = await db
			.select()
			.from(conversationParticipants)
			.where(
				and(
					eq(conversationParticipants.conversationId, conversationId),
					eq(conversationParticipants.userId, currentUser.id)
				)
			)
			.get();

		if (!participation) {
			return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
		}

		// Create a token that expires in 60 seconds (enough time to establish connection)
		const tokenData = {
			userId: currentUser.id,
			type: 'conversation' as const,
			conversationId,
			exp: Math.floor(Date.now() / 1000) + 60, // 60 seconds expiry
		};

		const payload = Buffer.from(JSON.stringify(tokenData)).toString('base64url');
		const signature = await createSignature(payload, authSecret);
		const token = `${payload}.${signature}`;

		return NextResponse.json({ token });
	} catch (error) {
		console.error('Error generating WebSocket token:', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
	}
}
