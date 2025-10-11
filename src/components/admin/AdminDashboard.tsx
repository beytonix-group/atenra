"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
	Table, 
	TableBody, 
	TableCell, 
	TableHead, 
	TableHeader, 
	TableRow 
} from "@/components/ui/table";
import { 
	Dialog, 
	DialogContent, 
	DialogHeader, 
	DialogTitle, 
	DialogFooter 
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui/role-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
	Users, 
	Activity, 
	Shield, 
	Plus, 
	Search, 
	Edit, 
	Loader2,
	TrendingUp,
	TrendingDown,
	UserPlus,
	UserCheck,
	MoreHorizontal,
	Mail,
	Phone,
	MapPin,
	Calendar,
	ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { 
	formatRoleName, 
	formatStatus, 
	getStatusBadgeVariant 
} from "@/lib/utils/format";
import { formatPhoneNumber, formatZipCode } from "@/lib/utils/input-format";
import { ActivityTable } from "./ActivityTable";

interface User {
	id: number;
	authUserId: string | null;
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
	country: string | null;
	status: "active" | "suspended" | "deleted";
	emailVerified: number;
	createdAt: string;
	roles: { roleId: number; roleName: string }[];
}

interface Role {
	id: number;
	name: string;
	description: string | null;
}

interface DashboardStats {
	totalUsers: number;
	activeUsers: number;
	superAdmins: number;
	userGrowth: number;
	activeGrowth: number;
	adminGrowth: number;
}

const US_STATES = [
	"Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
	"Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
	"Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
	"Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
	"New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
	"Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
	"Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
	"Wisconsin", "Wyoming"
];

export function AdminDashboard() {
	const [users, setUsers] = useState<User[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [stats, setStats] = useState<DashboardStats>({
		totalUsers: 0,
		activeUsers: 0,
		superAdmins: 0,
		userGrowth: 0,
		activeGrowth: 0,
		adminGrowth: 0
	});
	const [loading, setLoading] = useState(true);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [activitySearchTerm, setActivitySearchTerm] = useState("");
	const [saving, setSaving] = useState(false);
	const [activeTab, setActiveTab] = useState("users");
	const [usersWithActivity, setUsersWithActivity] = useState<any[]>([]);
	
	// New user form state
	const [newUser, setNewUser] = useState<{
		firstName: string;
		lastName: string;
		displayName: string;
		email: string;
		phone: string;
		addressLine1: string;
		addressLine2: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
		status: "active" | "suspended" | "deleted";
		emailVerified: boolean;
		roleId: number;
	}>({
		firstName: "",
		lastName: "",
		displayName: "",
		email: "",
		phone: "",
		addressLine1: "",
		addressLine2: "",
		city: "",
		state: "",
		zipCode: "",
		country: "US",
		status: "active",
		emailVerified: true,
		roleId: 0
	});

	useEffect(() => {
		fetchUsers();
		fetchRoles();
	}, []);
	
	useEffect(() => {
		if (users.length > 0) {
			fetchUsersWithActivity();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [users]);


	const fetchUsers = async () => {
		try {
			const response = await fetch("/api/admin/users");
			if (!response.ok) throw new Error("Failed to fetch users");
			const data = await response.json() as User[];
			setUsers(data);
			
			// Update stats
			const total = data.length;
			const active = data.filter(u => u.status === "active").length;
			const admins = data.filter(u => u.roles.some(r => r.roleName === "super_admin")).length;
			
			setStats({
				totalUsers: total,
				activeUsers: active,
				superAdmins: admins,
				userGrowth: 12,
				activeGrowth: 8,
				adminGrowth: 0
			});
		} catch (error) {
			toast.error("Failed to load users");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const fetchRoles = async () => {
		try {
			const response = await fetch("/api/admin/roles");
			if (!response.ok) throw new Error("Failed to fetch roles");
			const data = await response.json() as Role[];
			setRoles(data);
		} catch (error) {
			toast.error("Failed to load roles");
			console.error(error);
		}
	};
	
	const fetchUsersWithActivity = async () => {
		try {
			const response = await fetch("/api/admin/users/activity-summary");
			if (!response.ok) throw new Error("Failed to fetch users with activity");
			const data = await response.json() as any[];
			setUsersWithActivity(data);
		} catch (error) {
			console.error("Failed to fetch users with activity:", error);
			// Fallback to users without activity data
			const fallbackData = users.map(user => ({
				id: user.id,
				email: user.email,
				displayName: user.displayName,
				firstName: user.firstName,
				lastName: user.lastName,
				lastActivity: null
			}));
			setUsersWithActivity(fallbackData);
		}
	};

	const handleEditUser = (user: User) => {
		setSelectedUser(user);
		setEditModalOpen(true);
	};

	const handleSaveUser = async () => {
		if (!selectedUser) return;
		
		setSaving(true);
		try {
			const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(selectedUser),
			});
			
			if (!response.ok) throw new Error("Failed to update user");
			
			toast.success("User updated successfully");
			setEditModalOpen(false);
			fetchUsers();
		} catch (error) {
			toast.error("Failed to update user");
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleCreateUser = async () => {
		setSaving(true);
		try {
			const response = await fetch("/api/admin/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newUser),
			});
			
			if (!response.ok) throw new Error("Failed to create user");
			
			toast.success("User created successfully");
			setCreateModalOpen(false);
			fetchUsers();
			// Reset form
			setNewUser({
				firstName: "",
				lastName: "",
				displayName: "",
				email: "",
				phone: "",
				addressLine1: "",
				addressLine2: "",
				city: "",
				state: "",
				zipCode: "",
				country: "US",
				status: "active",
				emailVerified: true,
				roleId: 0
			});
		} catch (error) {
			toast.error("Failed to create user");
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const updateUserField = (field: keyof User, value: any) => {
		if (!selectedUser) return;
		setSelectedUser({ ...selectedUser, [field]: value });
	};

	const updateUserRole = (roleId: number) => {
		if (!selectedUser) return;
		const role = roles.find(r => r.id === roleId);
		if (role) {
			setSelectedUser({
				...selectedUser,
				roles: [{ roleId: role.id, roleName: role.name }]
			});
		}
	};

	const filteredUsers = users.filter(user => 
		user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const StatCard = ({ 
		icon: Icon, 
		label, 
		value, 
		growth,
		description 
	}: { 
		icon: any; 
		label: string; 
		value: number; 
		growth: number;
		description?: string;
	}) => (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{label}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value.toLocaleString()}</div>
				<p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
					{growth !== 0 && (
						<>
							{growth > 0 ? (
								<TrendingUp className="h-3 w-3 text-green-500" />
							) : (
								<TrendingDown className="h-3 w-3 text-red-500" />
							)}
							<span className={growth > 0 ? 'text-green-600' : 'text-red-600'}>
								{growth > 0 ? '+' : ''}{growth}%
							</span>
						</>
					)}
					{description && <span className="ml-1">{description}</span>}
				</p>
			</CardContent>
		</Card>
	);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-4 md:space-y-6">
			{/* Stats Overview - Desktop Only */}
			<div className="hidden lg:grid gap-3 grid-cols-4">
				<StatCard
					icon={Users}
					label="Total Users"
					value={stats.totalUsers}
					growth={stats.userGrowth}
					description="from last month"
				/>
				<StatCard
					icon={UserCheck}
					label="Active Users"
					value={stats.activeUsers}
					growth={stats.activeGrowth}
					description="from last month"
				/>
				<StatCard
					icon={Shield}
					label="Super Admins"
					value={stats.superAdmins}
					growth={stats.adminGrowth}
					description="total admins"
				/>
				<StatCard
					icon={UserPlus}
					label="New Today"
					value={0}
					growth={0}
					description="registrations"
				/>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2 mb-3 md:mb-4">
					<TabsTrigger value="users" className="text-xs sm:text-sm">User Management</TabsTrigger>
					<TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
				</TabsList>

				<TabsContent value="users" className="space-y-4">
					<Card>
						<CardHeader>
							{/* Desktop Header */}
							<div className="hidden lg:flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
								<div>
									<CardTitle className="text-lg">User Management</CardTitle>
									<CardDescription className="text-sm">
										Manage user accounts, roles, and permissions
									</CardDescription>
								</div>
								<div className="flex items-center gap-3">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search users..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-9 w-[250px]"
										/>
									</div>
									<Button onClick={() => setCreateModalOpen(true)}>
										<UserPlus className="mr-2 h-4 w-4" />
										Create User
									</Button>
								</div>
							</div>

							{/* Mobile Header - Search and Create on same line */}
							<div className="flex lg:hidden items-center gap-2">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-9 w-full text-sm h-9"
									/>
								</div>
								<Button onClick={() => setCreateModalOpen(true)} size="sm" className="flex-shrink-0">
									<UserPlus className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							{/* Mobile Card View */}
							<div className="lg:hidden divide-y">
								{filteredUsers.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										{searchTerm ? "No users found matching your search" : "No users found"}
									</div>
								) : (
									filteredUsers.map((user) => (
										<div key={user.id} className="p-4 space-y-3">
											{/* User Info */}
											<div className="flex items-start gap-3">
												<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
													<Users className="h-5 w-5 text-primary" />
												</div>
												<div className="flex-1 min-w-0">
													<div className="font-medium text-sm">
														{user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown"}
													</div>
													<div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
														<Mail className="h-3 w-3 flex-shrink-0" />
														<span className="truncate">{user.email}</span>
													</div>
												</div>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleEditUser(user)}
													className="flex-shrink-0"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</div>

											{/* Details Grid */}
											<div className="grid grid-cols-2 gap-3 text-xs">
												<div>
													<div className="text-muted-foreground mb-1">Status</div>
													<Badge variant={getStatusBadgeVariant(user.status) as any} className="text-xs">
														{formatStatus(user.status)}
													</Badge>
												</div>
												<div>
													<div className="text-muted-foreground mb-1">Role</div>
													{user.roles.length > 0 ? (
														<RoleBadge role={user.roles[0].roleName} />
													) : (
														<Badge variant="outline" className="text-xs">No Role</Badge>
													)}
												</div>
												<div>
													<div className="text-muted-foreground mb-1">Location</div>
													<div className="flex items-start gap-1">
														<MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
														<div className="min-w-0">
															{user.city && user.state ? (
																<div className="truncate">{user.city}, {user.state}</div>
															) : (
																<span className="text-muted-foreground">Not provided</span>
															)}
														</div>
													</div>
												</div>
												<div>
													<div className="text-muted-foreground mb-1">Joined</div>
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
														<span className="truncate">
															{user.createdAt && user.createdAt !== 'CURRENT_TIMESTAMP'
																? new Date(user.createdAt).toLocaleDateString('en-US', {
																	month: 'short',
																	day: 'numeric',
																	year: 'numeric'
																})
																: 'N/A'}
														</span>
													</div>
												</div>
											</div>

											{/* Email Verified Badge */}
											{user.emailVerified && (
												<Badge variant="secondary" className="text-xs">
													Email Verified
												</Badge>
											)}
										</div>
									))
								)}
							</div>

							{/* Desktop Table View */}
							<div className="hidden lg:block">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>User</TableHead>
											<TableHead>Location</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Roles</TableHead>
											<TableHead>Joined</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredUsers.length === 0 ? (
											<TableRow>
												<TableCell colSpan={6} className="text-center py-8">
													<div className="text-muted-foreground">
														{searchTerm ? "No users found matching your search" : "No users found"}
													</div>
												</TableCell>
											</TableRow>
										) : (
											filteredUsers.map((user) => (
												<TableRow key={user.id} className="hover:bg-muted/50">
													<TableCell>
														<div className="flex items-center gap-3">
															<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
																<Users className="h-5 w-5 text-primary" />
															</div>
															<div className="min-w-0">
																<div className="font-medium text-sm">
																	{user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown"}
																</div>
																<div className="flex items-center gap-1 text-xs text-muted-foreground">
																	<Mail className="h-3 w-3 flex-shrink-0" />
																	<span className="truncate">{user.email}</span>
																	{user.emailVerified && (
																		<Badge variant="secondary" className="text-xs px-1 py-0 flex-shrink-0">
																			Verified
																		</Badge>
																	)}
																</div>
															</div>
														</div>
													</TableCell>
													<TableCell>
														<div className="flex items-start gap-1 text-sm">
															<MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
															<div className="min-w-0">
																{user.city && user.state ? (
																	<>
																		<div className="truncate">{user.city}, {user.state}</div>
																		<div className="text-xs text-muted-foreground">{user.country || "US"}</div>
																	</>
																) : (
																	<span className="text-muted-foreground">Not provided</span>
																)}
															</div>
														</div>
													</TableCell>
													<TableCell>
														<Badge variant={getStatusBadgeVariant(user.status) as any} className="text-xs whitespace-nowrap">
															{formatStatus(user.status)}
														</Badge>
													</TableCell>
													<TableCell>
														{user.roles.length > 0 ? (
															<RoleBadge role={user.roles[0].roleName} />
														) : (
															<Badge variant="outline" className="text-xs">No Role</Badge>
														)}
													</TableCell>
													<TableCell>
														<div className="flex items-center gap-1 text-sm">
															<Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
															<span className="whitespace-nowrap">
																{user.createdAt && user.createdAt !== 'CURRENT_TIMESTAMP'
																	? new Date(user.createdAt).toLocaleDateString('en-US', {
																		month: 'short',
																		day: 'numeric',
																		year: 'numeric'
																	})
																	: 'N/A'}
															</span>
														</div>
													</TableCell>
													<TableCell className="text-right">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleEditUser(user)}
															className="flex-shrink-0"
														>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</TableCell>
												</TableRow>
											))
										)}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="activity" className="space-y-4">
					<Card>
						<CardHeader>
							{/* Desktop Header */}
							<div className="hidden lg:flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
								<div>
									<CardTitle className="text-lg">User Activity Tracking</CardTitle>
									<CardDescription className="text-sm">
										Monitor user interactions and system usage
									</CardDescription>
								</div>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search users..."
										value={activitySearchTerm}
										onChange={(e) => setActivitySearchTerm(e.target.value)}
										className="pl-9 w-[250px]"
									/>
								</div>
							</div>

							{/* Mobile Header - Compact search */}
							<div className="flex lg:hidden">
								<div className="relative flex-1">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search..."
										value={activitySearchTerm}
										onChange={(e) => setActivitySearchTerm(e.target.value)}
										className="pl-9 w-full text-sm h-9"
									/>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<ActivityTable 
								users={usersWithActivity.length > 0 ? usersWithActivity : users.map(user => ({
									id: user.id,
									email: user.email,
									displayName: user.displayName,
									firstName: user.firstName,
									lastName: user.lastName,
									activityCount: 0,
									lastActivity: null
								}))}
								searchTerm={activitySearchTerm}
							/>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Edit User Dialog */}
			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
					<DialogHeader>
						<DialogTitle className="text-base md:text-lg">Edit User</DialogTitle>
						<p className="text-xs md:text-sm text-muted-foreground">Update user information and permissions</p>
					</DialogHeader>
					{selectedUser && (
						<div className="space-y-3 md:space-y-4 py-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-firstName">First Name</Label>
									<Input
										id="edit-firstName"
										value={selectedUser.firstName || ""}
										onChange={(e) => updateUserField("firstName", e.target.value.slice(0, 30))}
										maxLength={30}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-lastName">Last Name</Label>
									<Input
										id="edit-lastName"
										value={selectedUser.lastName || ""}
										onChange={(e) => updateUserField("lastName", e.target.value.slice(0, 30))}
										maxLength={30}
									/>
								</div>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="edit-displayName">Display Name</Label>
								<Input
									id="edit-displayName"
									value={selectedUser.displayName || ""}
									onChange={(e) => updateUserField("displayName", e.target.value.slice(0, 65))}
									maxLength={65}
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-email" className="text-sm">Email</Label>
									<Input
										id="edit-email"
										value={selectedUser.email}
										onChange={(e) => updateUserField("email", e.target.value)}
										className="text-sm"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-phone" className="text-sm">Phone</Label>
									<Input
										id="edit-phone"
										value={selectedUser.phone || ""}
										onChange={(e) => {
											const formatted = formatPhoneNumber(e.target.value);
											updateUserField("phone", formatted);
										}}
										placeholder="(555) 555-5555"
										type="tel"
										className="text-sm"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-addressLine1" className="text-sm">Address Line 1</Label>
									<Input
										id="edit-addressLine1"
										value={selectedUser.addressLine1 || ""}
										onChange={(e) => updateUserField("addressLine1", e.target.value.slice(0, 50))}
										placeholder="Street address"
										maxLength={50}
										className="text-sm"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-addressLine2" className="text-sm">Address Line 2</Label>
									<Input
										id="edit-addressLine2"
										value={selectedUser.addressLine2 || ""}
										onChange={(e) => updateUserField("addressLine2", e.target.value.slice(0, 50))}
										placeholder="Apt, suite, etc."
										maxLength={50}
										className="text-sm"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-city" className="text-sm">City</Label>
									<Input
										id="edit-city"
										value={selectedUser.city || ""}
										onChange={(e) => updateUserField("city", e.target.value)}
										className="text-sm"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-state" className="text-sm">State</Label>
									<Select
										value={selectedUser.state || ""}
										onValueChange={(value) => updateUserField("state", value)}
									>
										<SelectTrigger id="edit-state" className="text-sm">
											<SelectValue placeholder="Select state" />
										</SelectTrigger>
										<SelectContent>
											{US_STATES.map((state) => (
												<SelectItem key={state} value={state} className="text-sm">
													{state}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-zipCode" className="text-sm">ZIP Code</Label>
									<Input
										id="edit-zipCode"
										value={selectedUser.zipCode || ""}
										onChange={(e) => {
											const formatted = formatZipCode(e.target.value);
											updateUserField("zipCode", formatted);
										}}
										placeholder="12345"
										maxLength={5}
										pattern="[0-9]{5}"
										className="text-sm"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-country" className="text-sm">Country</Label>
									<Input
										id="edit-country"
										value={selectedUser.country || "US"}
										onChange={(e) => updateUserField("country", e.target.value)}
										className="text-sm"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-status" className="text-sm">Status</Label>
									<Select
										value={selectedUser.status}
										onValueChange={(value) => updateUserField("status", value)}
									>
										<SelectTrigger id="edit-status" className="text-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="active" className="text-sm">{formatStatus("active")}</SelectItem>
											<SelectItem value="suspended" className="text-sm">{formatStatus("suspended")}</SelectItem>
											<SelectItem value="deleted" className="text-sm">{formatStatus("deleted")}</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-role" className="text-sm">Role</Label>
									<Select
										value={selectedUser.roles[0]?.roleId?.toString() || ""}
										onValueChange={(value) => updateUserRole(parseInt(value))}
									>
										<SelectTrigger id="edit-role" className="text-sm">
											<SelectValue placeholder="Select a role" />
										</SelectTrigger>
										<SelectContent>
											{roles.map((role) => (
												<SelectItem key={role.id} value={role.id.toString()} className="text-sm">
													{formatRoleName(role.name)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-emailVerified"
									checked={selectedUser.emailVerified === 1}
									onCheckedChange={(checked) => 
										updateUserField("emailVerified", checked ? 1 : 0)
									}
								/>
								<Label htmlFor="edit-emailVerified">Email Verified</Label>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSaveUser} disabled={saving}>
							{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Create User Dialog */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
					<DialogHeader>
						<DialogTitle className="text-base md:text-lg">Create User</DialogTitle>
						<p className="text-xs md:text-sm text-muted-foreground">Add a new user to the system</p>
					</DialogHeader>
					<div className="space-y-3 md:space-y-4 py-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
							<div className="space-y-2">
								<Label htmlFor="new-firstName">First Name</Label>
								<Input
									id="new-firstName"
									value={newUser.firstName}
									onChange={(e) => setNewUser({...newUser, firstName: e.target.value.slice(0, 30)})}
									placeholder="First name"
									maxLength={30}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-lastName">Last Name</Label>
								<Input
									id="new-lastName"
									value={newUser.lastName}
									onChange={(e) => setNewUser({...newUser, lastName: e.target.value.slice(0, 30)})}
									placeholder="Last name"
									maxLength={30}
								/>
							</div>
						</div>
						
						<div className="space-y-2">
							<Label htmlFor="new-displayName">Display Name</Label>
							<Input
								id="new-displayName"
								value={newUser.displayName}
								onChange={(e) => setNewUser({...newUser, displayName: e.target.value.slice(0, 65)})}
								placeholder="Display name"
								maxLength={65}
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
							<div className="space-y-2">
								<Label htmlFor="new-email" className="text-sm">Email *</Label>
								<Input
									id="new-email"
									type="email"
									value={newUser.email}
									onChange={(e) => setNewUser({...newUser, email: e.target.value})}
									placeholder="user@example.com"
									required
									className="text-sm"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-phone" className="text-sm">Phone</Label>
								<Input
									id="new-phone"
									value={newUser.phone}
									onChange={(e) => {
										const formatted = formatPhoneNumber(e.target.value);
										setNewUser({...newUser, phone: formatted});
									}}
									placeholder="(555) 555-5555"
									type="tel"
									className="text-sm"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
							<div className="space-y-2">
								<Label htmlFor="new-addressLine1" className="text-sm">Address Line 1</Label>
								<Input
									id="new-addressLine1"
									value={newUser.addressLine1}
									onChange={(e) => setNewUser({...newUser, addressLine1: e.target.value.slice(0, 50)})}
									placeholder="Street address"
									maxLength={50}
									className="text-sm"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-addressLine2" className="text-sm">Address Line 2</Label>
								<Input
									id="new-addressLine2"
									value={newUser.addressLine2}
									onChange={(e) => setNewUser({...newUser, addressLine2: e.target.value.slice(0, 50)})}
									placeholder="Apt, suite, etc."
									maxLength={50}
									className="text-sm"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
							<div className="space-y-2">
								<Label htmlFor="new-city" className="text-sm">City</Label>
								<Input
									id="new-city"
									value={newUser.city}
									onChange={(e) => setNewUser({...newUser, city: e.target.value})}
									placeholder="City"
									className="text-sm"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-state" className="text-sm">State</Label>
								<Select
									value={newUser.state}
									onValueChange={(value) => setNewUser({...newUser, state: value})}
								>
									<SelectTrigger id="new-state" className="text-sm">
										<SelectValue placeholder="Select state" />
									</SelectTrigger>
									<SelectContent>
										<Input
											placeholder="Search states..."
											className="mx-2 my-2 w-[calc(100%-16px)] text-sm"
										/>
										{US_STATES.map((state) => (
											<SelectItem key={state} value={state} className="text-sm">
												{state}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
							<div className="space-y-2">
								<Label htmlFor="new-zipCode" className="text-sm">ZIP Code</Label>
								<Input
									id="new-zipCode"
									value={newUser.zipCode}
									onChange={(e) => {
										const formatted = formatZipCode(e.target.value);
										setNewUser({...newUser, zipCode: formatted});
									}}
									placeholder="12345"
									maxLength={5}
									pattern="[0-9]{5}"
									className="text-sm"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-country" className="text-sm">Country</Label>
								<Input
									id="new-country"
									value={newUser.country}
									onChange={(e) => setNewUser({...newUser, country: e.target.value})}
									placeholder="Country"
									className="text-sm"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
							<div className="space-y-2">
								<Label htmlFor="new-status" className="text-sm">Status</Label>
								<Select
									value={newUser.status}
									onValueChange={(value: "active" | "suspended" | "deleted") =>
										setNewUser({...newUser, status: value})
									}
								>
									<SelectTrigger id="new-status" className="text-sm">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active" className="text-sm">{formatStatus("active")}</SelectItem>
										<SelectItem value="suspended" className="text-sm">{formatStatus("suspended")}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-role" className="text-sm">Role *</Label>
								<Select
									value={newUser.roleId.toString()}
									onValueChange={(value) => setNewUser({...newUser, roleId: parseInt(value)})}
								>
									<SelectTrigger id="new-role" className="text-sm">
										<SelectValue placeholder="Select a role" />
									</SelectTrigger>
									<SelectContent>
										{roles.map((role) => (
											<SelectItem key={role.id} value={role.id.toString()} className="text-sm">
												{formatRoleName(role.name)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="new-emailVerified"
								checked={newUser.emailVerified}
								onCheckedChange={(checked) => 
									setNewUser({...newUser, emailVerified: checked as boolean})
								}
							/>
							<Label htmlFor="new-emailVerified">Email Verified</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateModalOpen(false)}>
							Cancel
						</Button>
						<Button 
							onClick={handleCreateUser} 
							disabled={saving || !newUser.email || newUser.roleId === 0}
						>
							{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Create User
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}