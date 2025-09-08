/**
 * Format phone number as user types
 * Formats to: (XXX) XXX-XXXX
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limited = phoneNumber.slice(0, 10);
  
  // Format the number
  if (limited.length === 0) {
    return '';
  } else if (limited.length <= 3) {
    return `(${limited}`;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  } else {
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
}

/**
 * Format ZIP code as user types
 * Allows only 5 digits
 */
export function formatZipCode(value: string): string {
  // Remove all non-digit characters and limit to 5
  return value.replace(/\D/g, '').slice(0, 5);
}

/**
 * Get raw phone number (digits only)
 */
export function getRawPhoneNumber(formattedPhone: string): string {
  return formattedPhone.replace(/\D/g, '');
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}

/**
 * Validate ZIP code format
 */
export function isValidZipCode(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}