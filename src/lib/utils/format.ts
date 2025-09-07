export function formatStatusName(status: string): string {
	// Capitalize first letter of each word and replace underscores with spaces
	return status
		.split('_')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

export function formatRoleName(role: string): string {
	// Capitalize first letter of each word and replace underscores with spaces
	return role
		.split('_')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}