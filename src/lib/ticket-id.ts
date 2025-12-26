import { customAlphabet } from 'nanoid';

// Use uppercase letters and numbers for readable ticket IDs
// Excludes similar-looking characters: 0, O, I, L, 1
const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// Generate 6-character ticket IDs
const generateId = customAlphabet(alphabet, 6);

export function generateTicketId(): string {
  return generateId();
}
