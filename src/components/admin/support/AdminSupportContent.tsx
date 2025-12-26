"use client";

import { useState, useEffect, useCallback } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { TicketStatusBadge, type TicketStatus } from "@/components/support/TicketStatusBadge";
import { UrgencyBadge, type UrgencyLevel } from "@/components/support/UrgencySelector";
import { Loader2, RefreshCw, LifeBuoy, Eye, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

interface Ticket {
	id: number;
	subject: string;
	description: string;
	urgency: UrgencyLevel;
	status: TicketStatus;
	internalNotes: string | null;
	createdAt: number;
	updatedAt: number;
	resolvedAt: number | null;
	userId: number;
	companyId: number | null;
	assignedToUserId: number | null;
	userName: string | null;
	userEmail: string;
	companyName: string | null;
}

interface AssignedUser {
	id: number;
	displayName: string | null;
	email: string;
}

export function AdminSupportContent() {
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [total, setTotal] = useState(0);

	// Pagination
	const [page, setPage] = useState(1);
	const pageSize = 20;

	// Filters
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [urgencyFilter, setUrgencyFilter] = useState<string>("");

	// Detail dialog
	const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
	const [assignedUser, setAssignedUser] = useState<AssignedUser | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	// Update form state
	const [newStatus, setNewStatus] = useState<TicketStatus>("open");
	const [internalNotes, setInternalNotes] = useState("");

	const fetchTickets = useCallback(async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams();
			params.set("limit", pageSize.toString());
			params.set("offset", ((page - 1) * pageSize).toString());
			params.set("sortBy", "createdAt");
			params.set("sortOrder", "desc");
			if (statusFilter) params.set("status", statusFilter);
			if (urgencyFilter) params.set("urgency", urgencyFilter);

			const response = await fetch(`/api/support/tickets?${params.toString()}`);
			if (response.ok) {
				const data = await response.json() as { tickets?: Ticket[]; total?: number };
				setTickets(data.tickets || []);
				setTotal(data.total || 0);
			} else {
				toast.error("Failed to load tickets");
			}
		} catch (err) {
			console.error("Error fetching tickets:", err);
			toast.error("Failed to load tickets");
		} finally {
			setIsLoading(false);
		}
	}, [statusFilter, urgencyFilter, page, pageSize]);

	useEffect(() => {
		fetchTickets();
	}, [fetchTickets]);

	const openTicketDetail = async (ticket: Ticket) => {
		setSelectedTicket(ticket);
		setNewStatus(ticket.status);
		setInternalNotes(ticket.internalNotes || "");
		setIsDetailOpen(true);

		// Fetch full ticket details including assigned user
		try {
			const response = await fetch(`/api/support/tickets/${ticket.id}`);
			if (response.ok) {
				const data = await response.json() as { ticket: Ticket; assignedUser: AssignedUser | null };
				setSelectedTicket(data.ticket);
				setAssignedUser(data.assignedUser);
				setNewStatus(data.ticket.status);
				setInternalNotes(data.ticket.internalNotes || "");
			} else {
				toast.error("Failed to load ticket details");
			}
		} catch (err) {
			console.error("Error fetching ticket details:", err);
			toast.error("Failed to load ticket details");
		}
	};

	const handleUpdateTicket = async () => {
		if (!selectedTicket) return;

		setIsUpdating(true);
		try {
			const response = await fetch(`/api/support/tickets/${selectedTicket.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					status: newStatus,
					internalNotes: internalNotes || null,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json() as { error?: string };
				throw new Error(errorData.error || "Failed to update ticket");
			}

			toast.success("Ticket updated successfully");
			setIsDetailOpen(false);
			fetchTickets();
		} catch (err) {
			console.error("Error updating ticket:", err);
			toast.error(err instanceof Error ? err.message : "Failed to update ticket");
		} finally {
			setIsUpdating(false);
		}
	};

	const clearFilters = () => {
		setStatusFilter("");
		setUrgencyFilter("");
		setPage(1);
	};

	// Reset to page 1 when filters change
	useEffect(() => {
		setPage(1);
	}, [statusFilter, urgencyFilter]);

	const totalPages = Math.ceil(total / pageSize);
	const startItem = (page - 1) * pageSize + 1;
	const endItem = Math.min(page * pageSize, total);

	const hasFilters = statusFilter || urgencyFilter;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<LifeBuoy className="h-8 w-8 text-primary" />
				<div>
					<h1 className="text-2xl font-bold">Support Ticket Management</h1>
					<p className="text-muted-foreground">
						Manage and respond to user support tickets
					</p>
				</div>
			</div>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<div>
						<CardTitle>All Tickets</CardTitle>
						<CardDescription>
							{total} total ticket{total !== 1 ? "s" : ""}
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						{hasFilters && (
							<Button variant="ghost" size="sm" onClick={clearFilters}>
								<X className="h-4 w-4 mr-1" />
								Clear
							</Button>
						)}
						<Button
							variant="outline"
							size="sm"
							onClick={fetchTickets}
							disabled={isLoading}
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<RefreshCw className="h-4 w-4" />
							)}
						</Button>
					</div>
				</CardHeader>

				<CardContent>
					{/* Filters */}
					<div className="flex flex-wrap gap-4 mb-6">
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium">Filters:</span>
						</div>
						<Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
								<SelectItem value="open">Open</SelectItem>
								<SelectItem value="in_progress">In Progress</SelectItem>
								<SelectItem value="resolved">Resolved</SelectItem>
								<SelectItem value="closed">Closed</SelectItem>
							</SelectContent>
						</Select>
						<Select value={urgencyFilter || "all"} onValueChange={(v) => setUrgencyFilter(v === "all" ? "" : v)}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Urgency" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Urgencies</SelectItem>
								<SelectItem value="minor">Minor</SelectItem>
								<SelectItem value="urgent">Urgent</SelectItem>
								<SelectItem value="critical">Critical</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Table */}
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : tickets.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground">
							<LifeBuoy className="h-12 w-12 mx-auto mb-4 opacity-50" />
							<p>No tickets found</p>
							{hasFilters && (
								<p className="text-sm">Try adjusting your filters</p>
							)}
						</div>
					) : (
						<div className="border rounded-lg overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[60px]">ID</TableHead>
										<TableHead>User</TableHead>
										<TableHead className="max-w-[300px]">Subject</TableHead>
										<TableHead>Urgency</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Created</TableHead>
										<TableHead className="w-[80px]">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{tickets.map((ticket) => (
										<TableRow key={ticket.id}>
											<TableCell className="font-mono text-sm">
												#{ticket.id}
											</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<span className="font-medium text-sm">
														{ticket.userName || "Unknown"}
													</span>
													<span className="text-xs text-muted-foreground">
														{ticket.userEmail}
													</span>
													{ticket.companyName && (
														<span className="text-xs text-muted-foreground">
															{ticket.companyName}
														</span>
													)}
												</div>
											</TableCell>
											<TableCell className="max-w-[300px]">
												<span className="truncate block">{ticket.subject}</span>
											</TableCell>
											<TableCell>
												<UrgencyBadge urgency={ticket.urgency} />
											</TableCell>
											<TableCell>
												<TicketStatusBadge status={ticket.status} />
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{formatDistanceToNow(ticket.createdAt * 1000, {
													addSuffix: true,
												})}
											</TableCell>
											<TableCell>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => openTicketDetail(ticket)}
												>
													<Eye className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}

					{/* Pagination */}
					{total > 0 && (
						<div className="flex items-center justify-between mt-4 pt-4 border-t">
							<div className="text-sm text-muted-foreground">
								Showing {startItem} to {endItem} of {total} tickets
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1 || isLoading}
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>
								<span className="text-sm text-muted-foreground">
									Page {page} of {totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page >= totalPages || isLoading}
								>
									Next
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Ticket Detail Dialog */}
			<Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Ticket #{selectedTicket?.id}</DialogTitle>
						<DialogDescription>
							{selectedTicket?.subject}
						</DialogDescription>
					</DialogHeader>

					{selectedTicket && (
						<div className="space-y-6">
							{/* Ticket Info */}
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-muted-foreground">User:</span>
									<p className="font-medium">
										{selectedTicket.userName || "Unknown"}
									</p>
									<p className="text-muted-foreground">
										{selectedTicket.userEmail}
									</p>
								</div>
								<div>
									<span className="text-muted-foreground">Company:</span>
									<p className="font-medium">
										{selectedTicket.companyName || "Personal"}
									</p>
								</div>
								<div>
									<span className="text-muted-foreground">Urgency:</span>
									<div className="mt-1">
										<UrgencyBadge urgency={selectedTicket.urgency} />
									</div>
								</div>
								<div>
									<span className="text-muted-foreground">Current Status:</span>
									<div className="mt-1">
										<TicketStatusBadge status={selectedTicket.status} />
									</div>
								</div>
								<div>
									<span className="text-muted-foreground">Created:</span>
									<p className="font-medium">
										{format(selectedTicket.createdAt * 1000, "PPp")}
									</p>
								</div>
								{selectedTicket.resolvedAt && (
									<div>
										<span className="text-muted-foreground">Resolved:</span>
										<p className="font-medium">
											{format(selectedTicket.resolvedAt * 1000, "PPp")}
										</p>
									</div>
								)}
								{assignedUser && (
									<div>
										<span className="text-muted-foreground">Assigned To:</span>
										<p className="font-medium">
											{assignedUser.displayName || assignedUser.email}
										</p>
									</div>
								)}
							</div>

							{/* Description */}
							<div>
								<Label className="text-muted-foreground">Description</Label>
								<div
									className="mt-2 p-4 border rounded-lg prose prose-sm dark:prose-invert max-w-none"
									dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedTicket.description) }}
								/>
							</div>

							{/* Update Form */}
							<div className="space-y-4 pt-4 border-t">
								<h4 className="font-medium">Update Ticket</h4>

								<div className="space-y-2">
									<Label htmlFor="status">Status</Label>
									<Select value={newStatus} onValueChange={(v) => setNewStatus(v as TicketStatus)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="open">Open</SelectItem>
											<SelectItem value="in_progress">In Progress</SelectItem>
											<SelectItem value="resolved">Resolved</SelectItem>
											<SelectItem value="closed">Closed</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label htmlFor="notes">Internal Notes</Label>
									<Textarea
										id="notes"
										value={internalNotes}
										onChange={(e) => setInternalNotes(e.target.value)}
										placeholder="Add internal notes (only visible to admins)..."
										rows={4}
									/>
								</div>

								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										onClick={() => setIsDetailOpen(false)}
									>
										Cancel
									</Button>
									<Button onClick={handleUpdateTicket} disabled={isUpdating}>
										{isUpdating ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Updating...
											</>
										) : (
											"Update Ticket"
										)}
									</Button>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
