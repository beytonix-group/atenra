export function formatPhoneNumber(value: string): string {
	// Remove all non-numeric characters
	const numbers = value.replace(/\D/g, '');
	
	// Limit to 10 digits
	const truncated = numbers.slice(0, 10);
	
	// Format as (XXX) XXX-XXXX
	if (truncated.length === 0) return '';
	if (truncated.length <= 3) return `(${truncated}`;
	if (truncated.length <= 6) return `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`;
	return `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6, 10)}`;
}

export function unformatPhoneNumber(value: string): string {
	// Remove all non-numeric characters
	return value.replace(/\D/g, '');
}

export function isValidPhoneNumber(value: string): boolean {
	const numbers = value.replace(/\D/g, '');
	return numbers.length === 10;
}