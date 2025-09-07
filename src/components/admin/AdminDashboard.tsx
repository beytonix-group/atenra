"use client";

import { useState, useEffect } from "react";
import { UsersTable } from "./UsersTable";
import { UserEditModal } from "./UserEditModal";
import { UserCreateModal } from "./UserCreateModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Shield, Activity, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ROLES } from "@/lib/auth/roles";
import { useActivityTracker } from "@/hooks/use-activity-tracker";

export interface User {
	id: number;
	email: string;
	firstName: string | null;
	lastName: string | null;
	displayName: string | null;
	phone: string | null;
	addressLine1: string | null;
	addressLine2: string | null;
	city: string | null;
	state: string | null;
	zipCode: string | null;
	country: string;
	status: "active" | "suspended" | "deleted";
	emailVerified: number;
	createdAt: string;
	roles: { id: number; name: string }[];
}

export function AdminDashboard() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { t } = useLanguage();
	const { trackAction } = useActivityTracker();

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/admin/users");
			if (!response.ok) throw new Error("Failed to fetch users");
			const data = await response.json() as User[];
			setUsers(data);
		} catch (error) {
			console.error("Error fetching users:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleEditUser = (user: User) => {
		setSelectedUser(user);
		setIsEditModalOpen(true);
		trackAction("Admin Action", `Opened edit modal for user: ${user.email}`);
	};

	const handleUserUpdated = () => {
		fetchUsers();
		setIsEditModalOpen(false);
		setSelectedUser(null);
	};

	const handleUserCreated = () => {
		fetchUsers();
		setIsCreateModalOpen(false);
	};

	// Filter users based on search query
	const filteredUsers = users.filter(user => {
		if (!searchQuery) return true;
		
		const searchLower = searchQuery.toLowerCase();
		
		// Format date for search
		let formattedDate = '';
		if (user.createdAt && user.createdAt !== '') {
			const date = new Date(user.createdAt);
			if (!isNaN(date.getTime())) {
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const year = date.getFullYear();
				formattedDate = `${month}/${day}/${year}`;
			}
		}
		
		// Search across all relevant fields
		const searchFields = [
			user.email,
			user.firstName,
			user.lastName,
			user.displayName,
			user.phone,
			user.city,
			user.state,
			user.country,
			user.status,
			...user.roles.map(r => r.name),
			formattedDate,
		].filter(Boolean); // Remove null/undefined values
		
		return searchFields.some(field => 
			field?.toString().toLowerCase().includes(searchLower)
		);
	});

	// Stats cards data
	const stats = [
		{
			title: "Total Users",
			value: users.length.toString(),
			icon: Users,
			change: "+12%",
			changeType: "positive" as "positive" | "negative" | "neutral",
		},
		{
			title: "Active Users",
			value: users.filter(u => u.status === "active").length.toString(),
			icon: Activity,
			change: "+8%",
			changeType: "positive" as "positive" | "negative" | "neutral",
		},
		{
			title: "Super Admins",
			value: users.filter(u => u.roles.some(r => r.name === ROLES.SUPER_ADMIN)).length.toString(),
			icon: Shield,
			change: "0%",
			changeType: "neutral" as "positive" | "negative" | "neutral",
		},
	];

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{/* Header */}
			<div className="mb-8 flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-light text-foreground mb-2">Admin Dashboard</h1>
					<p className="text-muted-foreground">Manage users, roles, and system settings</p>
				</div>
				<div className="flex gap-2">
					<Button 
						variant="outline" 
						onClick={() => window.location.href = '/admin/activities'}
					>
						<Activity className="h-4 w-4 mr-2" />
						View Activities
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{stats.map((stat, index) => {
					const Icon = stat.icon;
					return (
						<div key={index} className="bg-card p-6 border border-border/50">
							<div className="flex items-center justify-between mb-4">
								<Icon className="h-8 w-8 text-muted-foreground" />
								<span className={`text-sm font-medium ${
									stat.changeType === "positive" ? "text-green-600" :
									stat.changeType === "negative" ? "text-red-600" :
									"text-muted-foreground"
								}`}>
									{stat.change}
								</span>
							</div>
							<div>
								<p className="text-2xl font-semibold">{stat.value}</p>
								<p className="text-sm text-muted-foreground">{stat.title}</p>
							</div>
						</div>
					);
				})}
			</div>

			{/* Tabbed Interface */}
			<Tabs defaultValue="users" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="users">User Management</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
				</TabsList>
				
				<TabsContent value="users" className="mt-6">
					<div className="bg-card border border-border/50">
						<div className="p-6 border-b border-border/50">
							{/* Search and Create User Row */}
							<div className="flex items-center justify-between gap-4">
								<div className="relative max-w-sm">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										type="text"
										placeholder="Search..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 pr-4 w-[300px]"
									/>
									{searchQuery && (
										<div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
											{filteredUsers.length} of {users.length} users
										</div>
									)}
								</div>
								
								<Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
									<Plus className="h-4 w-4" />
									Create User
								</Button>
							</div>
						</div>

						<UsersTable
							users={filteredUsers}
							loading={loading}
							onEditUser={handleEditUser}
							onRefresh={fetchUsers}
							searchQuery={searchQuery}
						/>
					</div>
				</TabsContent>
				
				<TabsContent value="activity" className="mt-6">
					<div className="bg-card border border-border/50 p-6">
						<h2 className="text-xl font-medium mb-4">Activity Log</h2>
						<p className="text-muted-foreground">Activity logging coming soon...</p>
					</div>
				</TabsContent>
			</Tabs>

			{/* Modals */}
			{selectedUser && (
				<UserEditModal
					user={selectedUser}
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false);
						setSelectedUser(null);
					}}
					onSuccess={handleUserUpdated}
				/>
			)}

			<UserCreateModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSuccess={handleUserCreated}
			/>
		</div>
	);
}