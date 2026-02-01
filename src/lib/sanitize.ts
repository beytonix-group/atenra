/**
 * Server-side HTML sanitization utility for Cloudflare Workers
 *
 * Since JSDOM is not available in Workers, we use a lightweight regex-based
 * sanitizer. This is applied BEFORE storing content in the database.
 * Client-side should ALSO use DOMPurify as a second layer of defense.
 */

// Allowed HTML tags for rich text messages
const ALLOWED_TAGS = new Set([
	'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
	'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
]);

// Allowed attributes per tag
const ALLOWED_ATTRS: Record<string, Set<string>> = {
	'a': new Set(['href', 'target', 'rel']),
	'*': new Set(['class']), // Allow class on all elements
};

// Patterns that indicate potentially malicious content
const DANGEROUS_PATTERNS = [
	/javascript\s*:/gi,
	/data\s*:/gi,
	/vbscript\s*:/gi,
	/on\w+\s*=/gi, // onclick, onerror, onload, etc.
	/<\s*script/gi,
	/<\s*iframe/gi,
	/<\s*embed/gi,
	/<\s*object/gi,
	/<\s*form/gi,
	/<\s*input/gi,
	/<\s*button/gi,
	/<\s*link/gi,
	/<\s*meta/gi,
	/<\s*style/gi,
	/<\s*svg/gi,
	/<\s*math/gi,
	/expression\s*\(/gi,
	/url\s*\(/gi,
	/@import/gi,
];

/**
 * Sanitizes HTML content for safe storage and display.
 *
 * This function:
 * 1. Removes dangerous patterns (script, event handlers, etc.)
 * 2. Strips disallowed tags while keeping their content
 * 3. Removes disallowed attributes from allowed tags
 * 4. Ensures href attributes don't contain javascript: or data: URIs
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
	if (!html || typeof html !== 'string') {
		return '';
	}

	let sanitized = html;

	// First pass: remove obviously dangerous patterns
	for (const pattern of DANGEROUS_PATTERNS) {
		sanitized = sanitized.replace(pattern, '');
	}

	// Remove all HTML comments
	sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

	// Remove null bytes and other control characters that could be used to bypass
	sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

	// Process tags - strip disallowed ones, clean attributes on allowed ones
	sanitized = processHtmlTags(sanitized);

	return sanitized.trim();
}

/**
 * Processes HTML tags, removing disallowed ones and cleaning attributes
 */
function processHtmlTags(html: string): string {
	// Match all HTML tags
	const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\s*([^>]*)?\/?>/g;

	return html.replace(tagRegex, (match, tagName, attributes = '') => {
		const tag = tagName.toLowerCase();

		// Check if tag is allowed
		if (!ALLOWED_TAGS.has(tag)) {
			// For closing tags, just remove them
			if (match.startsWith('</')) {
				return '';
			}
			// For opening tags, keep the content but remove the tag
			return '';
		}

		// For closing tags, just return them
		if (match.startsWith('</')) {
			return `</${tag}>`;
		}

		// Clean attributes for allowed tags
		const cleanAttrs = cleanAttributes(tag, attributes);
		const isSelfClosing = match.endsWith('/>') || tag === 'br';

		if (cleanAttrs) {
			return isSelfClosing ? `<${tag} ${cleanAttrs} />` : `<${tag} ${cleanAttrs}>`;
		}
		return isSelfClosing ? `<${tag} />` : `<${tag}>`;
	});
}

/**
 * Cleans attributes, keeping only allowed ones with safe values
 */
function cleanAttributes(tag: string, attrString: string): string {
	if (!attrString.trim()) {
		return '';
	}

	const allowedForTag = ALLOWED_ATTRS[tag] || new Set();
	const allowedForAll = ALLOWED_ATTRS['*'] || new Set();
	const combinedAllowed = new Set([...allowedForTag, ...allowedForAll]);

	// Parse attributes
	const attrRegex = /([a-zA-Z][-a-zA-Z0-9]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*))/g;
	const cleanedAttrs: string[] = [];
	let attrMatch;

	while ((attrMatch = attrRegex.exec(attrString)) !== null) {
		const attrName = attrMatch[1].toLowerCase();
		const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || '';

		if (!combinedAllowed.has(attrName)) {
			continue;
		}

		// Special handling for href attribute
		if (attrName === 'href') {
			const cleanHref = sanitizeHref(attrValue);
			if (cleanHref) {
				cleanedAttrs.push(`href="${escapeAttrValue(cleanHref)}"`);
				// Force safe link behavior
				cleanedAttrs.push('target="_blank"');
				cleanedAttrs.push('rel="noopener noreferrer"');
			}
			continue;
		}

		// Skip target and rel if href handles them
		if (attrName === 'target' || attrName === 'rel') {
			continue;
		}

		// For class attribute, only allow safe class names
		if (attrName === 'class') {
			const safeClasses = sanitizeClassNames(attrValue);
			if (safeClasses) {
				cleanedAttrs.push(`class="${safeClasses}"`);
			}
			continue;
		}

		cleanedAttrs.push(`${attrName}="${escapeAttrValue(attrValue)}"`);
	}

	return cleanedAttrs.join(' ');
}

/**
 * Sanitizes href values to prevent javascript: and data: URIs
 */
function sanitizeHref(href: string): string {
	if (!href) return '';

	const decoded = decodeURIComponent(href).toLowerCase().trim();

	// Block javascript:, data:, vbscript:, and other dangerous schemes
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
 * Escapes special characters in attribute values
 */
function escapeAttrValue(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Strips all HTML tags, keeping only text content
 * Useful for previews or plain-text requirements
 */
export function stripHtml(html: string): string {
	if (!html || typeof html !== 'string') {
		return '';
	}

	return html
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#x27;/g, "'")
		.trim();
}
