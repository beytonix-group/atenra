"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ROLES } from "@/lib/auth/roles";

interface UserRole {
	id: number;
	name: string;
}

export function useUserRole() {
	const { data: session, status } = useSession();
	const [roles, setRoles] = useState<UserRole[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUserRoles = async () => {
			if (!session?.user?.email || status !== "authenticated") {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch("/api/auth/user-roles");
				if (response.ok) {
					const userRoles = await response.json();
					setRoles(userRoles);
				}
			} catch (error) {
				console.error("Error fetching user roles:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUserRoles();
	}, [session, status]);

	const hasRole = (roleName: string): boolean => {
		return roles.some(role => role.name === roleName);
	};

	const hasAnyRole = (roleNames: string[]): boolean => {
		return roles.some(role => roleNames.includes(role.name));
	};

	return {
		roles,
		loading,
		hasRole,
		hasAnyRole,
		isSuperAdmin: hasRole(ROLES.SUPER_ADMIN),
		isManager: hasRole(ROLES.MANAGER),
		isEmployee: hasRole(ROLES.EMPLOYEE),
		isUser: hasRole(ROLES.USER),
	};
}