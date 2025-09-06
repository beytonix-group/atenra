"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, RefreshCw, Mail, Phone } from "lucide-react";
import type { User } from "./AdminDashboard";
import { ROLES } from "@/lib/auth/roles";

interface UsersTableProps {
	users: User[];
	loading: boolean;
	onEditUser: (user: User) => void;
	onRefresh: () => void;
	searchQuery?: string;
}

export function UsersTable({ users, loading, onEditUser, onRefresh, searchQuery }: UsersTableProps) {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			case "suspended":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
			case "deleted":
				return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
		}
	};

	const getRoleColor = (roleName: string) => {
		switch (roleName) {
			case ROLES.SUPER_ADMIN:
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
			case ROLES.MANAGER:
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
			case ROLES.EMPLOYEE:
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			case ROLES.USER:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
		}
	};

	if (loading) {
		return (
			<div className="p-8">
				<div className="flex items-center justify-center">
					<RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
					<span className="ml-2 text-muted-foreground">Loading users...</span>
				</div>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="p-8 text-center">
				<p className="text-muted-foreground mb-4">
					{searchQuery 
						? `No users found matching "${searchQuery}"`
						: "No users found"}
				</p>
				{searchQuery ? (
					<p className="text-sm text-muted-foreground">
						Try adjusting your search terms
					</p>
				) : (
					<Button onClick={onRefresh} variant="outline" size="sm">
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</Button>
				)}
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full">
				<thead className="bg-muted/50">
					<tr>
						<th className="text-left p-4 font-medium text-sm">User</th>
						<th className="text-left p-4 font-medium text-sm">Contact</th>
						<th className="text-left p-4 font-medium text-sm">Location</th>
						<th className="text-left p-4 font-medium text-sm">Status</th>
						<th className="text-left p-4 font-medium text-sm">Roles</th>
						<th className="text-left p-4 font-medium text-sm">Joined</th>
						<th className="text-right p-4 font-medium text-sm">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border/50">
					{users.map((user) => (
						<tr key={user.id} className="hover:bg-muted/30 transition-colors">
							<td className="p-4">
								<div className="flex flex-col">
									<span className="font-medium text-sm">
										{user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "No Name"}
									</span>
									<span className="text-xs text-muted-foreground">{user.email}</span>
									{user.emailVerified ? (
										<span className="text-xs text-green-600">✓ Verified</span>
									) : (
										<span className="text-xs text-yellow-600">⚠ Unverified</span>
									)}
								</div>
							</td>
							<td className="p-4">
								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-1 text-xs text-muted-foreground">
										<Mail className="h-3 w-3" />
										<span>{user.email}</span>
									</div>
									{user.phone && (
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<Phone className="h-3 w-3" />
											<span>{user.phone}</span>
										</div>
									)}
								</div>
							</td>
							<td className="p-4">
								<div className="text-sm text-muted-foreground">
									{user.city && user.state ? (
										<span>{user.city}, {user.state}</span>
									) : user.city ? (
										<span>{user.city}</span>
									) : user.state ? (
										<span>{user.state}</span>
									) : (
										<span>—</span>
									)}
									<br />
									<span className="text-xs">{user.country}</span>
								</div>
							</td>
							<td className="p-4">
								<Badge className={getStatusColor(user.status)} variant="secondary">
									{user.status}
								</Badge>
							</td>
							<td className="p-4">
								<div className="flex flex-wrap gap-1">
									{user.roles.length > 0 ? (
										user.roles.map((role) => (
											<Badge
												key={role.id}
												variant="secondary"
												className={`${getRoleColor(role.name)} text-xs`}
											>
												{role.name}
											</Badge>
										))
									) : (
										<Badge variant="secondary" className="text-xs">
											no role
										</Badge>
									)}
								</div>
							</td>
							<td className="p-4">
								<span className="text-sm text-muted-foreground">
									{user.createdAt && user.createdAt !== '' ? (() => {
										const date = new Date(user.createdAt);
										if (isNaN(date.getTime())) {
											return '';
										}
										const month = String(date.getMonth() + 1).padStart(2, '0');
										const day = String(date.getDate()).padStart(2, '0');
										const year = date.getFullYear();
										return `${month}/${day}/${year}`;
									})() : ''}
								</span>
							</td>
							<td className="p-4 text-right">
								<Button
									variant="outline"
									size="sm"
									onClick={() => onEditUser(user)}
									className="gap-2"
								>
									<Edit className="h-3 w-3" />
									Edit
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}