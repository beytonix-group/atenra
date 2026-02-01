/**
 * CSRF Protection Utilities
 *
 * Implements the double-submit cookie pattern for CSRF protection.
 * This works alongside SameSite cookie settings in NextAuth.
 */

// CSRF token cookie name
export const CSRF_COOKIE_NAME = '__Host-csrf-token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generates a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a Set-Cookie header value for the CSRF token
 */
export function createCsrfCookie(token: string, isProduction: boolean): string {
	const secure = isProduction ? 'Secure; ' : '';
	// __Host- prefix requires Secure, Path=/, and no Domain
	// Using __Host- only in production since it requires HTTPS
	const cookieName = isProduction ? CSRF_COOKIE_NAME : 'csrf-token';

	return `${cookieName}=${token}; ${secure}HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`;
}

/**
 * Validates CSRF token from request against cookie
 *
 * Checks:
 * 1. Token exists in both header and cookie
 * 2. Tokens match
 *
 * @returns true if valid, false otherwise
 */
export function validateCsrfToken(request: Request): {
	valid: boolean;
	error?: string;
} {
	const isProduction = process.env.NODE_ENV === 'production';
	const cookieName = isProduction ? CSRF_COOKIE_NAME : 'csrf-token';

	// Get token from header
	const headerToken = request.headers.get(CSRF_HEADER_NAME);

	// Get token from cookie
	const cookieHeader = request.headers.get('cookie') || '';
	const cookies = parseCookies(cookieHeader);
	const cookieToken = cookies[cookieName];

	if (!headerToken) {
		return { valid: false, error: 'Missing CSRF token in header' };
	}

	if (!cookieToken) {
		return { valid: false, error: 'Missing CSRF token cookie' };
	}

	// Constant-time comparison to prevent timing attacks
	if (!constantTimeEqual(headerToken, cookieToken)) {
		return { valid: false, error: 'CSRF token mismatch' };
	}

	return { valid: true };
}

/**
 * Validates Origin header for cross-origin request protection
 *
 * @param request - The incoming request
 * @param allowedOrigins - List of allowed origins
 * @returns Validation result
 */
export function validateOrigin(
	request: Request,
	allowedOrigins: string[]
): { valid: boolean; error?: string } {
	const origin = request.headers.get('origin');
	const referer = request.headers.get('referer');

	// For same-origin requests, Origin header may be null
	// In that case, check the Referer header
	if (!origin) {
		if (!referer) {
			// No origin info at all - could be same-origin or a direct request
			// Be cautious and allow (further checks like session auth still apply)
			return { valid: true };
		}

		// Extract origin from referer
		try {
			const refererUrl = new URL(referer);
			const refererOrigin = refererUrl.origin;

			if (allowedOrigins.some(allowed => normalizeOrigin(allowed) === normalizeOrigin(refererOrigin))) {
				return { valid: true };
			}

			return { valid: false, error: `Invalid referer origin: ${refererOrigin}` };
		} catch {
			return { valid: false, error: 'Invalid referer header' };
		}
	}

	// Check if origin is in the allowed list
	if (allowedOrigins.some(allowed => normalizeOrigin(allowed) === normalizeOrigin(origin))) {
		return { valid: true };
	}

	return { valid: false, error: `Invalid origin: ${origin}` };
}

/**
 * Normalizes origin URL for comparison
 */
function normalizeOrigin(origin: string): string {
	try {
		const url = new URL(origin);
		return url.origin.toLowerCase();
	} catch {
		return origin.toLowerCase();
	}
}

/**
 * Parse cookies from cookie header string
 */
function parseCookies(cookieHeader: string): Record<string, string> {
	const cookies: Record<string, string> = {};

	if (!cookieHeader) return cookies;

	cookieHeader.split(';').forEach(cookie => {
		const [name, ...valueParts] = cookie.trim().split('=');
		if (name) {
			cookies[name.trim()] = valueParts.join('=').trim();
		}
	});

	return cookies;
}

/**
 * Constant-time string comparison to prevent timing attacks
 * Does not leak length information through early return
 */
function constantTimeEqual(a: string, b: string): boolean {
	const maxLength = Math.max(a.length, b.length);
	let result = a.length ^ b.length; // Include length difference in result

	for (let i = 0; i < maxLength; i++) {
		const charA = i < a.length ? a.charCodeAt(i) : 0;
		const charB = i < b.length ? b.charCodeAt(i) : 0;
		result |= charA ^ charB;
	}

	return result === 0;
}

/**
 * Gets the list of allowed origins from environment
 */
export function getAllowedOrigins(): string[] {
	const origins: string[] = [];

	// Add NEXTAUTH_URL
	const nextAuthUrl = process.env.NEXTAUTH_URL;
	if (nextAuthUrl) {
		origins.push(nextAuthUrl);
	}

	// Add production URLs
	const productionUrl = process.env.PRODUCTION_URL;
	if (productionUrl) {
		origins.push(productionUrl);
	}

	// Add additional allowed origins (comma-separated)
	const additionalOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim());
	if (additionalOrigins) {
		origins.push(...additionalOrigins);
	}

	// Always allow localhost in development
	if (process.env.NODE_ENV !== 'production') {
		origins.push('http://localhost:3000');
		origins.push('http://127.0.0.1:3000');
	}

	return origins.filter(Boolean);
}

/**
 * Checks if a request method is state-changing (requires CSRF protection)
 */
export function isStateChangingMethod(method: string): boolean {
	return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}
