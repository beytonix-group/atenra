import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { userCompanyJobs, users, serviceCategories } from "@/server/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { JobStatusBadge, JobPriorityBadge } from "@/components/company-dashboard";
import { Plus, MapPin } from "lucide-react";

interface JobsPageProps {
	params: Promise<{ companyId: string }>;
	searchParams: Promise<{ status?: string; priority?: string; page?: string }>;
}

function formatDate(timestamp: number | null): string {
	if (!timestamp) return '-';
	return new Date(timestamp * 1000).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

function formatCurrency(cents: number | null): string {
	if (cents === null || cents === undefined) return '-';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(cents / 100);
}

async function getJobs(
	companyId: number,
	status?: string,
	priority?: string,
	page: number = 1,
	limit: number = 20
) {
	const conditions = [eq(userCompanyJobs.companyId, companyId)];

	if (status && ['active', 'completed', 'cancelled'].includes(status)) {
		conditions.push(eq(userCompanyJobs.status, status as 'active' | 'completed' | 'cancelled'));
	}

	if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
		conditions.push(eq(userCompanyJobs.priority, priority as 'low' | 'medium' | 'high' | 'urgent'));
	}

	const offset = (page - 1) * limit;

	const jobs = await db
		.select({
			id: userCompanyJobs.id,
			description: userCompanyJobs.description,
			status: userCompanyJobs.status,
			priority: userCompanyJobs.priority,
			startDate: userCompanyJobs.startDate,
			endDate: userCompanyJobs.endDate,
			budgetCents: userCompanyJobs.budgetCents,
			jobCity: userCompanyJobs.jobCity,
			jobState: userCompanyJobs.jobState,
			createdAt: userCompanyJobs.createdAt,
			customerFirstName: users.firstName,
			customerLastName: users.lastName,
			customerEmail: users.email,
			categoryName: serviceCategories.name,
		})
		.from(userCompanyJobs)
		.leftJoin(users, eq(userCompanyJobs.userId, users.id))
		.leftJoin(serviceCategories, eq(userCompanyJobs.categoryId, serviceCategories.id))
		.where(and(...conditions))
		.orderBy(desc(userCompanyJobs.createdAt))
		.limit(limit)
		.offset(offset)
		.all();

	const countResult = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(userCompanyJobs)
		.where(and(...conditions))
		.get();

	return {
		jobs,
		total: countResult?.count || 0,
		page,
		limit,
		totalPages: Math.ceil((countResult?.count || 0) / limit),
	};
}

async function getJobCounts(companyId: number) {
	const result = await db
		.select({
			total: sql<number>`COUNT(*)`,
			active: sql<number>`SUM(CASE WHEN ${userCompanyJobs.status} = 'active' THEN 1 ELSE 0 END)`,
			completed: sql<number>`SUM(CASE WHEN ${userCompanyJobs.status} = 'completed' THEN 1 ELSE 0 END)`,
			cancelled: sql<number>`SUM(CASE WHEN ${userCompanyJobs.status} = 'cancelled' THEN 1 ELSE 0 END)`,
		})
		.from(userCompanyJobs)
		.where(eq(userCompanyJobs.companyId, companyId))
		.get();

	return {
		total: result?.total || 0,
		active: result?.active || 0,
		completed: result?.completed || 0,
		cancelled: result?.cancelled || 0,
	};
}

export default async function JobsPage({ params, searchParams }: JobsPageProps) {
	const { companyId } = await params;
	const { status, priority, page } = await searchParams;
	const companyIdNum = parseInt(companyId, 10);
	const parsedPage = page ? parseInt(page, 10) : 1;

	if (isNaN(companyIdNum) || companyIdNum <= 0) {
		notFound();
	}

	const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

	const [{ jobs, total, totalPages }, counts] = await Promise.all([
		getJobs(companyIdNum, status, priority, currentPage),
		getJobCounts(companyIdNum),
	]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
					<p className="text-muted-foreground">
						Manage your company jobs and track progress
					</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					New Job
				</Button>
			</div>

			{/* Filter Tabs */}
			<div className="flex gap-2 flex-wrap">
				<Link href={`/company/${companyId}/jobs${priority ? `?priority=${priority}` : ''}`}>
					<Button variant={!status ? "default" : "outline"} size="sm">
						All ({counts.total})
					</Button>
				</Link>
				<Link href={`/company/${companyId}/jobs?status=active${priority ? `&priority=${priority}` : ''}`}>
					<Button variant={status === 'active' ? "default" : "outline"} size="sm">
						Active ({counts.active})
					</Button>
				</Link>
				<Link href={`/company/${companyId}/jobs?status=completed${priority ? `&priority=${priority}` : ''}`}>
					<Button variant={status === 'completed' ? "default" : "outline"} size="sm">
						Completed ({counts.completed})
					</Button>
				</Link>
				<Link href={`/company/${companyId}/jobs?status=cancelled${priority ? `&priority=${priority}` : ''}`}>
					<Button variant={status === 'cancelled' ? "default" : "outline"} size="sm">
						Cancelled ({counts.cancelled})
					</Button>
				</Link>
			</div>

			{/* Jobs Table */}
			<Card>
				<CardContent className="p-0">
					{jobs.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">No jobs found</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Description</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Budget</TableHead>
									<TableHead>Priority</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Created</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{jobs.map((job) => (
									<TableRow key={job.id}>
										<TableCell className="font-medium max-w-[200px] truncate">
											{job.description}
										</TableCell>
										<TableCell>
											{[job.customerFirstName, job.customerLastName].filter(Boolean).join(' ') || job.customerEmail || 'Unknown'}
										</TableCell>
										<TableCell>
											{job.categoryName || '-'}
										</TableCell>
										<TableCell>
											{job.jobCity && job.jobState ? (
												<span className="flex items-center gap-1 text-sm">
													<MapPin className="h-3 w-3" />
													{job.jobCity}, {job.jobState}
												</span>
											) : '-'}
										</TableCell>
										<TableCell>
											{formatCurrency(job.budgetCents)}
										</TableCell>
										<TableCell>
											<JobPriorityBadge priority={job.priority as 'low' | 'medium' | 'high' | 'urgent'} />
										</TableCell>
										<TableCell>
											<JobStatusBadge status={job.status as 'active' | 'completed' | 'cancelled'} />
										</TableCell>
										<TableCell className="text-muted-foreground">
											{formatDate(job.createdAt)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, total)} of {total} jobs
					</p>
					<div className="flex gap-2">
						{currentPage > 1 && (
							<Link href={`/company/${companyId}/jobs?${status ? `status=${status}&` : ''}page=${currentPage - 1}`}>
								<Button variant="outline" size="sm">Previous</Button>
							</Link>
						)}
						{currentPage < totalPages && (
							<Link href={`/company/${companyId}/jobs?${status ? `status=${status}&` : ''}page=${currentPage + 1}`}>
								<Button variant="outline" size="sm">Next</Button>
							</Link>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
