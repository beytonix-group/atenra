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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { 
	formatRoleName, 
	formatStatus, 
	getRoleBadgeVariant, 
	getStatusBadgeVariant 
} from "@/lib/utils/format";

interface User {
	id: number;
	authUserId: string | null;
	email: string;
	firstName: string | null;
	lastName: string | null;
	displayName: string | null;
	phone: string | null;
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

export function AdminDashboard() {
	const [users, setUsers] = useState<User[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [saving, setSaving] = useState(false);
	
	const itemsPerPage = 10;

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

	const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
	const paginatedUsers = filteredUsers.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const getStatusBadge = (status: string) => {
		return <Badge variant={getStatusBadgeVariant(status)}>{formatStatus(status)}</Badge>;
	};

	const getRoleBadge = (roles: { roleId: number; roleName: string }[]) => {
		if (roles.length === 0) return <Badge variant="outline">No Role</Badge>;
		const role = roles[0];
		return <Badge variant={getRoleBadgeVariant(role.roleName)}>{formatRoleName(role.roleName)}</Badge>;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="bg-card rounded-lg border p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold">User Management</h2>
					<div className="flex items-center space-x-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search users..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-9 w-64"
							/>
						</div>
					</div>
				</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Email</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Verified</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{paginatedUsers.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">{user.email}</TableCell>
									<TableCell>
										{user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "-"}
									</TableCell>
									<TableCell>{user.phone || "-"}</TableCell>
									<TableCell>{getStatusBadge(user.status)}</TableCell>
									<TableCell>{getRoleBadge(user.roles)}</TableCell>
									<TableCell>
										{user.emailVerified ? (
											<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
												Verified
											</Badge>
										) : (
											<Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
												Unverified
											</Badge>
										)}
									</TableCell>
									<TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleEditUser(user)}
										>
											<Pencil className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{totalPages > 1 && (
					<div className="flex items-center justify-between mt-4">
						<p className="text-sm text-muted-foreground">
							Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
						</p>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="text-sm">
								Page {currentPage} of {totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
								disabled={currentPage === totalPages}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</div>

			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
					</DialogHeader>
					{selectedUser && (
						<div className="space-y-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										value={selectedUser.email}
										onChange={(e) => updateUserField("email", e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="phone">Phone</Label>
									<Input
										id="phone"
										value={selectedUser.phone || ""}
										onChange={(e) => updateUserField("phone", e.target.value)}
										placeholder="Phone number"
									/>
								</div>
							</div>
							
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										value={selectedUser.firstName || ""}
										onChange={(e) => updateUserField("firstName", e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										value={selectedUser.lastName || ""}
										onChange={(e) => updateUserField("lastName", e.target.value)}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="displayName">Display Name</Label>
								<Input
									id="displayName"
									value={selectedUser.displayName || ""}
									onChange={(e) => updateUserField("displayName", e.target.value)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="status">Status</Label>
									<Select
										value={selectedUser.status}
										onValueChange={(value) => updateUserField("status", value)}
									>
										<SelectTrigger id="status">
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
									<Label htmlFor="role">Role</Label>
									<Select
										value={selectedUser.roles[0]?.roleId?.toString() || ""}
										onValueChange={(value) => updateUserRole(parseInt(value))}
									>
										<SelectTrigger id="role">
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

							<div className="space-y-2">
								<Label htmlFor="emailVerified">Email Verification</Label>
								<Select
									value={selectedUser.emailVerified.toString()}
									onValueChange={(value) => updateUserField("emailVerified", parseInt(value))}
								>
									<SelectTrigger id="emailVerified">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1">Verified</SelectItem>
										<SelectItem value="0">Unverified</SelectItem>
									</SelectContent>
								</Select>
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
		</div>
	);
}