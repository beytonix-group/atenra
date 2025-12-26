"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "./RichTextEditor";
import { UrgencySelector, type UrgencyLevel } from "./UrgencySelector";
import { TicketStatusBadge, type TicketStatus } from "./TicketStatusBadge";
import { UrgencyBadge } from "./UrgencySelector";
import { Loader2, Plus, RefreshCw, LifeBuoy, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Ticket {
	id: number;
	subject: string;
	description: string;
	urgency: UrgencyLevel;
	status: TicketStatus;
	createdAt: number;
	updatedAt: number;
	resolvedAt: number | null;
	companyId: number | null;
	companyName: string | null;
}

interface Company {
	id: number;
	name: string;
}

export function SupportPageContent() {
	const { data: session } = useSession();
	const [activeTab, setActiveTab] = useState("new");

	// New ticket form state
	const [subject, setSubject] = useState("");
	const [description, setDescription] = useState("<p></p>");
	const [urgency, setUrgency] = useState<UrgencyLevel>("minor");
	const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Tickets list state
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [companies, setCompanies] = useState<Company[]>([]);
	const [isLoadingTickets, setIsLoadingTickets] = useState(false);
	const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

	// Fetch user's companies
	useEffect(() => {
		const abortController = new AbortController();

		async function fetchCompanies() {
			setIsLoadingCompanies(true);
			try {
				const response = await fetch("/api/user/owned-companies", {
					signal: abortController.signal,
				});
				if (response.ok) {
					const data = await response.json() as { companies?: Company[] };
					setCompanies(data.companies || []);
				} else {
					toast.error("Failed to load companies");
				}
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") {
					return; // Request cancelled, ignore
				}
				console.error("Error fetching companies:", error);
				toast.error("Failed to load companies");
			} finally {
				if (!abortController.signal.aborted) {
					setIsLoadingCompanies(false);
				}
			}
		}
		fetchCompanies();

		return () => abortController.abort();
	}, []);

	// Fetch user's tickets
	const fetchTickets = useCallback(async (signal?: AbortSignal) => {
		setIsLoadingTickets(true);
		try {
			const response = await fetch("/api/support/tickets?limit=50&sortBy=createdAt&sortOrder=desc", {
				signal,
			});
			if (response.ok) {
				const data = await response.json() as { tickets?: Ticket[] };
				setTickets(data.tickets || []);
			} else {
				toast.error("Failed to load tickets");
			}
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				return; // Request cancelled, ignore
			}
			console.error("Error fetching tickets:", error);
			toast.error("Failed to load tickets");
		} finally {
			setIsLoadingTickets(false);
		}
	}, []);

	useEffect(() => {
		if (activeTab === "history") {
			const abortController = new AbortController();
			fetchTickets(abortController.signal);
			return () => abortController.abort();
		}
	}, [activeTab, fetchTickets]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate
		if (!subject.trim() || subject.length < 5) {
			toast.error("Subject must be at least 5 characters");
			return;
		}

		// Get plain text from HTML for validation (using DOMParser to prevent XSS)
		const parser = new DOMParser();
		const doc = parser.parseFromString(description, "text/html");
		const plainText = doc.body.textContent || "";

		if (plainText.length < 10) {
			toast.error("Description must be at least 10 characters");
			return;
		}

		if (plainText.length > 5000) {
			toast.error("Description cannot exceed 5000 characters");
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await fetch("/api/support/tickets", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					subject: subject.trim(),
					description,
					urgency,
					companyId: selectedCompanyId ? parseInt(selectedCompanyId) : undefined,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json() as { error?: string };
				throw new Error(errorData.error || "Failed to create ticket");
			}

			toast.success("Support ticket created successfully");

			// Reset form
			setSubject("");
			setDescription("<p></p>");
			setUrgency("minor");
			setSelectedCompanyId("");

			// Switch to history tab
			setActiveTab("history");
		} catch (err) {
			console.error("Error creating ticket:", err);
			toast.error(err instanceof Error ? err.message : "Failed to create ticket");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-4xl space-y-6">
			<div className="flex items-center gap-3">
				<LifeBuoy className="h-8 w-8 text-primary" />
				<div>
					<h1 className="text-2xl font-bold">Help & Support</h1>
					<p className="text-muted-foreground">
						Submit a support ticket or view your existing tickets
					</p>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-2 mb-6">
					<TabsTrigger value="new" className="flex items-center gap-2">
						<Plus className="h-4 w-4" />
						New Ticket
					</TabsTrigger>
					<TabsTrigger value="history" className="flex items-center gap-2">
						<Clock className="h-4 w-4" />
						My Tickets
					</TabsTrigger>
				</TabsList>

				<TabsContent value="new">
					<Card>
						<CardHeader>
							<CardTitle>Create Support Ticket</CardTitle>
							<CardDescription>
								Describe your issue and we&apos;ll get back to you as soon as possible
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="subject">Subject *</Label>
									<Input
										id="subject"
										value={subject}
										onChange={(e) => setSubject(e.target.value)}
										placeholder="Brief summary of your issue"
										maxLength={200}
										required
									/>
									<p className="text-xs text-muted-foreground">
										{subject.length} / 200 characters
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">Description *</Label>
									<RichTextEditor
										value={description}
										onChange={setDescription}
										placeholder="Describe your issue in detail..."
										maxLength={5000}
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="urgency">Urgency Level *</Label>
										<UrgencySelector
											value={urgency}
											onChange={setUrgency}
										/>
									</div>

									{companies.length > 0 && (
										<div className="space-y-2">
											<Label htmlFor="company">Related Company (Optional)</Label>
											<Select
												value={selectedCompanyId || "personal"}
												onValueChange={(v) => setSelectedCompanyId(v === "personal" ? "" : v)}
												disabled={isLoadingCompanies}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select a company" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="personal">Personal (No company)</SelectItem>
													{companies.map((company) => (
														<SelectItem key={company.id} value={company.id.toString()}>
															{company.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
								</div>

								<Button type="submit" disabled={isSubmitting} className="w-full">
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Submitting...
										</>
									) : (
										"Submit Ticket"
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="history">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
							<div>
								<CardTitle>My Support Tickets</CardTitle>
								<CardDescription>
									View the status of your submitted tickets
								</CardDescription>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => fetchTickets()}
								disabled={isLoadingTickets}
							>
								{isLoadingTickets ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<RefreshCw className="h-4 w-4" />
								)}
							</Button>
						</CardHeader>
						<CardContent>
							{isLoadingTickets ? (
								<div className="flex items-center justify-center py-12">
									<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : tickets.length === 0 ? (
								<div className="text-center py-12 text-muted-foreground">
									<LifeBuoy className="h-12 w-12 mx-auto mb-4 opacity-50" />
									<p>No support tickets yet</p>
									<p className="text-sm">Create a new ticket if you need help</p>
								</div>
							) : (
								<div className="space-y-4">
									{tickets.map((ticket) => (
										<div
											key={ticket.id}
											className="border rounded-lg p-4 space-y-3"
										>
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1 min-w-0">
													<h3 className="font-medium truncate">{ticket.subject}</h3>
													<p className="text-sm text-muted-foreground">
														Ticket #{ticket.id}
														{ticket.companyName && (
															<span> - {ticket.companyName}</span>
														)}
													</p>
												</div>
												<div className="flex items-center gap-2 flex-shrink-0">
													<UrgencyBadge urgency={ticket.urgency} />
													<TicketStatusBadge status={ticket.status} />
												</div>
											</div>
											<div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
												<span>
													Created{" "}
													{formatDistanceToNow(ticket.createdAt * 1000, {
														addSuffix: true,
													})}
												</span>
												{ticket.resolvedAt && (
													<span>
														Resolved{" "}
														{formatDistanceToNow(ticket.resolvedAt * 1000, {
															addSuffix: true,
														})}
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
