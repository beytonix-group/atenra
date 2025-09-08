"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
	TrendingDown
} from "lucide-react";
import { toast } from "sonner";
import { 
	formatRoleName, 
	formatStatus, 
	getRoleBadgeVariant, 
	getStatusBadgeVariant 
} from "@/lib/utils/format";
import { formatPhoneNumber, formatZipCode } from "@/lib/utils/input-format";

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
	const [saving, setSaving] = useState(false);
	const [activeTab, setActiveTab] = useState("users");
	
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
		growth 
	}: { 
		icon: any; 
		label: string; 
		value: number; 
		growth: number;
	}) => (
		<div className="bg-card rounded-lg border p-6">
			<div className="flex items-center justify-between">
				<div>
					<div className="flex items-center gap-2 text-muted-foreground mb-2">
						<Icon className="h-5 w-5" />
						<span className="text-sm font-medium">{label}</span>
					</div>
					<div className="text-3xl font-bold">{value}</div>
				</div>
				<div className={`flex items-center gap-1 text-sm ${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600'}`}>
					{growth > 0 ? (
						<>
							<TrendingUp className="h-4 w-4" />
							<span>+{growth}%</span>
						</>
					) : growth < 0 ? (
						<>
							<TrendingDown className="h-4 w-4" />
							<span>{growth}%</span>
						</>
					) : (
						<span>0%</span>
					)}
				</div>
			</div>
		</div>
	);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<StatCard 
					icon={Users} 
					label="Total Users" 
					value={stats.totalUsers} 
					growth={stats.userGrowth} 
				/>
				<StatCard 
					icon={Activity} 
					label="Active Users" 
					value={stats.activeUsers} 
					growth={stats.activeGrowth} 
				/>
				<StatCard 
					icon={Shield} 
					label="Super Admins" 
					value={stats.superAdmins} 
					growth={stats.adminGrowth} 
				/>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2 mb-4">
					<TabsTrigger value="users">User Management</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
				</TabsList>

				<TabsContent value="users" className="space-y-4">
					<div className="bg-card rounded-lg border">
						<div className="p-4 border-b">
							<div className="flex items-center justify-between">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-9 max-w-sm"
									/>
								</div>
								<Button onClick={() => setCreateModalOpen(true)}>
									<Plus className="mr-2 h-4 w-4" />
									Create User
								</Button>
							</div>
						</div>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>User</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Roles</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											<div>
												<div className="font-medium">
													{user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown"}
												</div>
												<div className="text-sm text-muted-foreground">
													{user.email}
												</div>
												{user.emailVerified && (
													<span className="text-xs text-green-600">✓ Verified</span>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="space-y-1">
												<div className="text-sm">{user.email}</div>
												{user.phone && (
													<div className="text-sm text-muted-foreground">{user.phone}</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="text-sm">
												{user.city && user.state ? (
													<>
														{user.city}, {user.state}
														<br />
														<span className="text-muted-foreground">{user.country || "US"}</span>
													</>
												) : (
													<span className="text-muted-foreground">Not provided</span>
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={getStatusBadgeVariant(user.status) as any}>
												{formatStatus(user.status)}
											</Badge>
										</TableCell>
										<TableCell>
											{user.roles.length > 0 ? (
												<Badge variant={getRoleBadgeVariant(user.roles[0].roleName)}>
													{formatRoleName(user.roles[0].roleName)}
												</Badge>
											) : (
												<Badge variant="outline">No Role</Badge>
											)}
										</TableCell>
										<TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleEditUser(user)}
											>
												<Edit className="h-4 w-4" />
												<span className="ml-2">Edit</span>
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</TabsContent>

				<TabsContent value="activity" className="space-y-4">
					<div className="bg-card rounded-lg border p-8">
						<div className="text-center text-muted-foreground">
							<Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p className="text-lg font-medium">Activity tracking coming soon</p>
							<p className="text-sm mt-2">This feature is currently under development</p>
						</div>
					</div>
				</TabsContent>
			</Tabs>

			{/* Edit User Dialog */}
			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<p className="text-sm text-muted-foreground">Update user information and permissions</p>
					</DialogHeader>
					{selectedUser && (
						<div className="space-y-4 py-4">
							<div className="grid grid-cols-2 gap-4">
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

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-email">Email</Label>
									<Input
										id="edit-email"
										value={selectedUser.email}
										onChange={(e) => updateUserField("email", e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-phone">Phone</Label>
									<Input
										id="edit-phone"
										value={selectedUser.phone || ""}
										onChange={(e) => {
											const formatted = formatPhoneNumber(e.target.value);
											updateUserField("phone", formatted);
										}}
										placeholder="(555) 555-5555"
										type="tel"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-addressLine1">Address Line 1</Label>
									<Input
										id="edit-addressLine1"
										value={selectedUser.addressLine1 || ""}
										onChange={(e) => updateUserField("addressLine1", e.target.value.slice(0, 50))}
										placeholder="Street address"
										maxLength={50}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-addressLine2">Address Line 2</Label>
									<Input
										id="edit-addressLine2"
										value={selectedUser.addressLine2 || ""}
										onChange={(e) => updateUserField("addressLine2", e.target.value.slice(0, 50))}
										placeholder="Apartment, suite, etc. (optional)"
										maxLength={50}
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-city">City</Label>
									<Input
										id="edit-city"
										value={selectedUser.city || ""}
										onChange={(e) => updateUserField("city", e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-state">State</Label>
									<Select
										value={selectedUser.state || ""}
										onValueChange={(value) => updateUserField("state", value)}
									>
										<SelectTrigger id="edit-state">
											<SelectValue placeholder="Select state" />
										</SelectTrigger>
										<SelectContent>
											{US_STATES.map((state) => (
												<SelectItem key={state} value={state}>
													{state}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-zipCode">ZIP Code</Label>
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
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-country">Country</Label>
									<Input
										id="edit-country"
										value={selectedUser.country || "US"}
										onChange={(e) => updateUserField("country", e.target.value)}
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-status">Status</Label>
									<Select
										value={selectedUser.status}
										onValueChange={(value) => updateUserField("status", value)}
									>
										<SelectTrigger id="edit-status">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="active">{formatStatus("active")}</SelectItem>
											<SelectItem value="suspended">{formatStatus("suspended")}</SelectItem>
											<SelectItem value="deleted">{formatStatus("deleted")}</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-role">Role</Label>
									<Select
										value={selectedUser.roles[0]?.roleId?.toString() || ""}
										onValueChange={(value) => updateUserRole(parseInt(value))}
									>
										<SelectTrigger id="edit-role">
											<SelectValue placeholder="Select a role" />
										</SelectTrigger>
										<SelectContent>
											{roles.map((role) => (
												<SelectItem key={role.id} value={role.id.toString()}>
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
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Create User</DialogTitle>
						<p className="text-sm text-muted-foreground">Add a new user to the system</p>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="grid grid-cols-2 gap-4">
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

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="new-email">Email *</Label>
								<Input
									id="new-email"
									type="email"
									value={newUser.email}
									onChange={(e) => setNewUser({...newUser, email: e.target.value})}
									placeholder="user@example.com"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-phone">Phone</Label>
								<Input
									id="new-phone"
									value={newUser.phone}
									onChange={(e) => {
										const formatted = formatPhoneNumber(e.target.value);
										setNewUser({...newUser, phone: formatted});
									}}
									placeholder="(555) 555-5555"
									type="tel"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="new-addressLine1">Address Line 1</Label>
								<Input
									id="new-addressLine1"
									value={newUser.addressLine1}
									onChange={(e) => setNewUser({...newUser, addressLine1: e.target.value.slice(0, 50)})}
									placeholder="Street address"
									maxLength={50}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-addressLine2">Address Line 2</Label>
								<Input
									id="new-addressLine2"
									value={newUser.addressLine2}
									onChange={(e) => setNewUser({...newUser, addressLine2: e.target.value.slice(0, 50)})}
									placeholder="Apartment, suite, etc. (optional)"
									maxLength={50}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="new-city">City</Label>
								<Input
									id="new-city"
									value={newUser.city}
									onChange={(e) => setNewUser({...newUser, city: e.target.value})}
									placeholder="City"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-state">State</Label>
								<Select
									value={newUser.state}
									onValueChange={(value) => setNewUser({...newUser, state: value})}
								>
									<SelectTrigger id="new-state">
										<SelectValue placeholder="Select state" />
									</SelectTrigger>
									<SelectContent>
										<Input 
											placeholder="Search states..." 
											className="mx-2 my-2 w-[calc(100%-16px)]"
										/>
										{US_STATES.map((state) => (
											<SelectItem key={state} value={state}>
												{state}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="new-zipCode">ZIP Code</Label>
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
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-country">Country</Label>
								<Input
									id="new-country"
									value={newUser.country}
									onChange={(e) => setNewUser({...newUser, country: e.target.value})}
									placeholder="Country"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="new-status">Status</Label>
								<Select
									value={newUser.status}
									onValueChange={(value: "active" | "suspended" | "deleted") => 
										setNewUser({...newUser, status: value})
									}
								>
									<SelectTrigger id="new-status">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">{formatStatus("active")}</SelectItem>
										<SelectItem value="suspended">{formatStatus("suspended")}</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-role">Role *</Label>
								<Select
									value={newUser.roleId.toString()}
									onValueChange={(value) => setNewUser({...newUser, roleId: parseInt(value)})}
								>
									<SelectTrigger id="new-role">
										<SelectValue placeholder="Select a role" />
									</SelectTrigger>
									<SelectContent>
										{roles.map((role) => (
											<SelectItem key={role.id} value={role.id.toString()}>
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