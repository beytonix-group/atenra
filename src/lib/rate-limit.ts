/**
 * Simple in-memory rate limiter for API endpoints
 *
 * This provides basic protection against abuse. For production at scale,
 * consider using Cloudflare Rate Limiting or a Redis-based solution.
 */

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 5 minutes)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanupExpiredEntries(): void {
	const now = Date.now();
	if (now - lastCleanup < CLEANUP_INTERVAL) return;

	lastCleanup = now;
	for (const [key, entry] of rateLimitStore.entries()) {
		if (entry.resetAt < now) {
			rateLimitStore.delete(key);
		}
	}
}

export interface RateLimitConfig {
	/** Time window in milliseconds */
	windowMs: number;
	/** Maximum number of requests allowed in the window */
	maxRequests: number;
}

export interface RateLimitResult {
	/** Whether the request is allowed */
	allowed: boolean;
	/** Number of requests remaining in the window */
	remaining: number;
	/** When the rate limit window resets (Unix timestamp in ms) */
	resetAt: number;
}

/**
 * Check if a request is allowed under the rate limit
 *
 * @param identifier - Unique identifier for the client (e.g., user ID, IP)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export function checkRateLimit(
	identifier: string,
	config: RateLimitConfig
): RateLimitResult {
	cleanupExpiredEntries();

	const now = Date.now();
	const entry = rateLimitStore.get(identifier);

	// If no entry or window expired, create new entry
	if (!entry || entry.resetAt < now) {
		const resetAt = now + config.windowMs;
		rateLimitStore.set(identifier, { count: 1, resetAt });
		return {
			allowed: true,
			remaining: config.maxRequests - 1,
			resetAt,
		};
	}

	// Check if limit exceeded
	if (entry.count >= config.maxRequests) {
		return {
			allowed: false,
			remaining: 0,
			resetAt: entry.resetAt,
		};
	}

	// Increment count
	entry.count++;
	return {
		allowed: true,
		remaining: config.maxRequests - entry.count,
		resetAt: entry.resetAt,
	};
}

/**
 * Pre-configured rate limits for different endpoints
 */
export const RATE_LIMITS = {
	/** Checkout endpoints - 10 requests per minute */
	checkout: {
		windowMs: 60 * 1000,
		maxRequests: 10,
	} satisfies RateLimitConfig,

	/** General API - 60 requests per minute */
	api: {
		windowMs: 60 * 1000,
		maxRequests: 60,
	} satisfies RateLimitConfig,

	/** Auth endpoints - 5 requests per minute */
	auth: {
		windowMs: 60 * 1000,
		maxRequests: 5,
	} satisfies RateLimitConfig,
} as const;
