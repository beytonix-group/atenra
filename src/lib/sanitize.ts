/**
 * Server-side HTML sanitization utility
 *
 * Uses the well-maintained 'xss' library which works in Cloudflare Workers
 * (no DOM required, pure JavaScript implementation).
 *
 * Client-side should ALSO use DOMPurify as a second layer of defense.
 */

import xss, { IFilterXSSOptions, FilterXSS, escapeAttrValue } from 'xss';

// Sanitization options for rich text messages
const xssOptions: IFilterXSSOptions = {
	whiteList: {
		p: [],
		br: [],
		strong: [],
		b: [],
		em: [],
		i: [],
		u: [],
		ul: [],
		ol: [],
		li: [],
		a: ['href', 'target', 'rel'],
		span: ['class'],
		div: ['class'],
		h1: [],
		h2: [],
		h3: [],
		h4: [],
		h5: [],
		h6: [],
	},
	stripIgnoreTag: true, // Remove disallowed tags entirely
	stripIgnoreTagBody: ['script', 'style', 'iframe', 'frame', 'object', 'embed'], // Remove these tags AND their content
	onTagAttr: (tag, name, value) => {
		// Custom handling for href attributes
		if (tag === 'a' && name === 'href') {
			const sanitizedHref = sanitizeHref(value);
			if (!sanitizedHref) {
				return ''; // Remove the attribute entirely
			}
			// Force safe link behavior
			return `href="${escapeAttrValue(sanitizedHref)}" target="_blank" rel="noopener noreferrer"`;
		}

		// For class attribute, only allow safe class names
		if (name === 'class') {
			const safeClasses = sanitizeClassNames(value);
			if (!safeClasses) {
				return ''; // Remove empty class attribute
			}
			return `class="${safeClasses}"`;
		}

		// Skip target and rel on <a> tags since we handle them in href
		if (tag === 'a' && (name === 'target' || name === 'rel')) {
			return '';
		}

		// Let xss library handle other attributes with default behavior
		return undefined;
	},
};

// Create a reusable xss instance
const xssFilter = new FilterXSS(xssOptions);

/**
 * Sanitizes HTML content for safe storage and display.
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
	if (!html || typeof html !== 'string') {
		return '';
	}

	return xssFilter.process(html).trim();
}

/**
 * Sanitizes href values to prevent javascript: and data: URIs
 */
function sanitizeHref(href: string): string {
	if (!href) return '';

	// Decode and check for dangerous schemes
	let decoded: string;
	try {
		decoded = decodeURIComponent(href).toLowerCase().trim();
	} catch {
		// Invalid encoding, reject
		return '';
	}

	// Block dangerous schemes
	if (
		decoded.startsWith('javascript:') ||
		decoded.startsWith('data:') ||
		decoded.startsWith('vbscript:') ||
		decoded.startsWith('file:')
	) {
		return '';
	}

	// Only allow http, https, mailto, and relative URLs
	if (
		href.startsWith('http://') ||
		href.startsWith('https://') ||
		href.startsWith('mailto:') ||
		href.startsWith('/') ||
		href.startsWith('#') ||
		(!href.includes(':'))
	) {
		return href;
	}

	return '';
}

/**
 * Sanitizes class names to prevent CSS injection
 */
function sanitizeClassNames(classes: string): string {
	// Only allow alphanumeric, hyphens, underscores, and spaces
	return classes
		.split(/\s+/)
		.filter(cls => /^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(cls))
		.join(' ');
}

/**
 * Strips all HTML tags, keeping only text content
 * Useful for previews or plain-text requirements
 */
export function stripHtml(html: string): string {
	if (!html || typeof html !== 'string') {
		return '';
	}

	// Use xss with empty whitelist to strip all tags
	const stripped = xss(html, { whiteList: {}, stripIgnoreTag: true });

	return stripped
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#x27;/g, "'")
		.trim();
}
