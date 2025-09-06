/**
 * Role constants for the application
 * Using const assertion for type safety and reusability
 */
export const ROLES = {
	SUPER_ADMIN: "super_admin",
	MANAGER: "manager",
	EMPLOYEE: "employee",
	USER: "user",
} as const;

/**
 * Type derived from the ROLES constant
 * This ensures type safety when using role values
 */
export type UserRole = typeof ROLES[keyof typeof ROLES];

/**
 * Helper function to get all role values as an array
 */
export const getAllRoles = (): UserRole[] => Object.values(ROLES);

/**
 * Helper function to check if a string is a valid role
 */
export const isValidRole = (role: string): role is UserRole => {
	return Object.values(ROLES).includes(role as UserRole);
};