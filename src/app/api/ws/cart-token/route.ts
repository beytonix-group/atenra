import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser, canManageUserCarts } from '@/lib/auth-helpers';
import type { CartTokenData } from '@/lib/cart-websocket-types';

/**
 * Generate a cryptographically signed WebSocket authentication token for cart.
 * Token format: base64url(payload).base64url(signature)
 *
 * This endpoint validates:
 * 1. User is authenticated
 * 2. User is either accessing their own cart OR has permission to manage user carts (agent/super_admin)
 *
 * GET /api/ws/cart-token?cartUserId=123
 * - If cartUserId is omitted or equals current user's ID, generates token for own cart (role=owner)
 * - If cartUserId is a different user's ID, requires canManageUserCarts permission (role=agent)
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
		const cartUserIdParam = searchParams.get('cartUserId');

		// If no cartUserId provided or it's the current user's ID, treat as own cart
		let cartUserId: number;
		let role: 'owner' | 'agent';

		if (!cartUserIdParam) {
			// No cartUserId specified, default to own cart
			cartUserId = currentUser.id;
			role = 'owner';
		} else {
			cartUserId = parseInt(cartUserIdParam);
			if (isNaN(cartUserId)) {
				return NextResponse.json({ error: 'Invalid cartUserId' }, { status: 400 });
			}

			if (cartUserId === currentUser.id) {
				// Accessing own cart
				role = 'owner';
			} else {
				// Accessing another user's cart - require permission
				const hasPermission = await canManageUserCarts();
				if (!hasPermission) {
					return NextResponse.json(
						{ error: 'Not authorized to view this cart' },
						{ status: 403 }
					);
				}
				role = 'agent';
			}
		}

		// Create a token that expires in 60 seconds (enough time to establish connection)
		const tokenData: CartTokenData = {
			userId: currentUser.id,
			cartUserId,
			role,
			exp: Math.floor(Date.now() / 1000) + 60, // 60 seconds expiry
		};

		// Sign the token with AUTH_SECRET using HMAC-SHA256
		const authSecret = process.env.AUTH_SECRET;
		if (!authSecret) {
			console.error('AUTH_SECRET not configured for cart WebSocket token signing');
			return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
		}

		const payload = Buffer.from(JSON.stringify(tokenData)).toString('base64url');
		const signature = await createSignature(payload, authSecret);
		const token = `${payload}.${signature}`;

		return NextResponse.json({ token });
	} catch (error) {
		console.error('Error generating cart WebSocket token:', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
	}
}
