import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { companyInvoices } from "@/server/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { InvoiceStatusBadge, InvoiceQuickActions, NewInvoiceButton } from "@/components/company-dashboard";

const INVOICES_PER_PAGE = 20;

interface InvoicesPageProps {
	params: Promise<{ companyId: string }>;
	searchParams: Promise<{ status?: string; page?: string }>;
}

function formatDate(timestamp: number | null): string {
	if (!timestamp) return '-';
	return new Date(timestamp * 1000).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

function formatCurrency(cents: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(cents / 100);
}

type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'void' | 'refunded';

async function getInvoices(
	companyId: number,
	status?: string,
	page: number = 1,
	limit: number = INVOICES_PER_PAGE
) {
	const conditions = [eq(companyInvoices.companyId, companyId)];
	const validStatuses: InvoiceStatus[] = ['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'void', 'refunded'];

	// Handle 'pending' pseudo-status that includes both 'sent' and 'viewed'
	if (status === 'pending') {
		conditions.push(sql`${companyInvoices.status} IN ('sent', 'viewed')`);
	} else if (status && validStatuses.includes(status as InvoiceStatus)) {
		conditions.push(eq(companyInvoices.status, status as InvoiceStatus));
	}

	const offset = (page - 1) * limit;

	const invoices = await db
		.select({
			id: companyInvoices.id,
			invoiceNumber: companyInvoices.invoiceNumber,
			customerName: companyInvoices.customerName,
			customerEmail: companyInvoices.customerEmail,
			customerCity: companyInvoices.customerCity,
			customerState: companyInvoices.customerState,
			subtotalCents: companyInvoices.subtotalCents,
			taxAmountCents: companyInvoices.taxAmountCents,
			totalCents: companyInvoices.totalCents,
			amountPaidCents: companyInvoices.amountPaidCents,
			status: companyInvoices.status,
			invoiceDate: companyInvoices.invoiceDate,
			dueDate: companyInvoices.dueDate,
			paidAt: companyInvoices.paidAt,
		})
		.from(companyInvoices)
		.where(and(...conditions))
		.orderBy(desc(companyInvoices.invoiceDate))
		.limit(limit)
		.offset(offset)
		.all();

	const countResult = await db
		.select({ count: sql<number>`COUNT(*)` })
		.from(companyInvoices)
		.where(and(...conditions))
		.get();

	return {
		invoices,
		total: countResult?.count || 0,
		page,
		limit,
		totalPages: Math.ceil((countResult?.count || 0) / limit),
	};
}

async function getInvoiceCounts(companyId: number) {
	const result = await db
		.select({
			total: sql<number>`COUNT(*)`,
			draft: sql<number>`SUM(CASE WHEN ${companyInvoices.status} = 'draft' THEN 1 ELSE 0 END)`,
			pending: sql<number>`SUM(CASE WHEN ${companyInvoices.status} IN ('sent', 'viewed') THEN 1 ELSE 0 END)`,
			paid: sql<number>`SUM(CASE WHEN ${companyInvoices.status} = 'paid' THEN 1 ELSE 0 END)`,
			overdue: sql<number>`SUM(CASE WHEN ${companyInvoices.status} = 'overdue' THEN 1 ELSE 0 END)`,
		})
		.from(companyInvoices)
		.where(eq(companyInvoices.companyId, companyId))
		.get();

	return {
		total: result?.total || 0,
		draft: result?.draft || 0,
		pending: result?.pending || 0,
		paid: result?.paid || 0,
		overdue: result?.overdue || 0,
	};
}

export default async function InvoicesPage({ params, searchParams }: InvoicesPageProps) {
	const { companyId } = await params;
	const { status, page } = await searchParams;
	const companyIdNum = parseInt(companyId, 10);
	const parsedPage = page ? parseInt(page, 10) : 1;

	if (isNaN(companyIdNum) || companyIdNum <= 0) {
		notFound();
	}

	const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

	const [{ invoices, total, totalPages }, counts] = await Promise.all([
		getInvoices(companyIdNum, status, currentPage),
		getInvoiceCounts(companyIdNum),
	]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
					<p className="text-muted-foreground">
						Manage and track your company invoices
					</p>
				</div>
				<NewInvoiceButton companyId={companyIdNum} />
			</div>

			{/* Filter Tabs */}
			<div className="flex gap-2 flex-wrap">
				<Link href={`/company/${companyId}/invoices`}>
					<Button variant={!status ? "default" : "outline"} size="sm">
						All ({counts.total})
					</Button>
				</Link>
				<Link href={`/company/${companyId}/invoices?status=draft`}>
					<Button variant={status === 'draft' ? "default" : "outline"} size="sm">
						Draft ({counts.draft})
					</Button>
				</Link>
				<Link href={`/company/${companyId}/invoices?status=pending`}>
					<Button variant={status === 'pending' ? "default" : "outline"} size="sm">
						Pending ({counts.pending})
					</Button>
				</Link>
				<Link href={`/company/${companyId}/invoices?status=paid`}>
					<Button variant={status === 'paid' ? "default" : "outline"} size="sm">
						Paid ({counts.paid})
					</Button>
				</Link>
				<Link href={`/company/${companyId}/invoices?status=overdue`}>
					<Button variant={status === 'overdue' ? "default" : "outline"} size="sm">
						Overdue ({counts.overdue})
					</Button>
				</Link>
			</div>

			{/* Invoices Table */}
			<Card>
				<CardContent className="p-0">
					{invoices.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">No invoices found</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Invoice #</TableHead>
									<TableHead>Customer</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Invoice Date</TableHead>
									<TableHead>Due Date</TableHead>
									<TableHead className="text-right">Total</TableHead>
									<TableHead className="text-right">Paid</TableHead>
									<TableHead className="text-right">Balance</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-[50px]">
										<span className="sr-only">Actions</span>
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoices.map((invoice) => {
									const balance = invoice.totalCents - invoice.amountPaidCents;
									return (
										<TableRow key={invoice.id}>
											<TableCell className="font-medium">
												#{invoice.invoiceNumber}
											</TableCell>
											<TableCell>
												<div>
													<p className="font-medium">{invoice.customerName}</p>
													{invoice.customerEmail && (
														<p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
													)}
												</div>
											</TableCell>
											<TableCell>
												{invoice.customerCity && invoice.customerState
													? `${invoice.customerCity}, ${invoice.customerState}`
													: '-'}
											</TableCell>
											<TableCell>
												{formatDate(invoice.invoiceDate)}
											</TableCell>
											<TableCell>
												{formatDate(invoice.dueDate)}
											</TableCell>
											<TableCell className="text-right font-medium">
												{formatCurrency(invoice.totalCents)}
											</TableCell>
											<TableCell className="text-right text-green-600">
												{formatCurrency(invoice.amountPaidCents)}
											</TableCell>
											<TableCell className="text-right">
												{balance > 0 ? (
													<span className="text-orange-600">{formatCurrency(balance)}</span>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</TableCell>
											<TableCell>
												<InvoiceStatusBadge status={invoice.status as InvoiceStatus} />
											</TableCell>
											<TableCell>
												<InvoiceQuickActions
													companyId={companyIdNum}
													invoiceId={invoice.id}
													currentStatus={invoice.status as InvoiceStatus}
													invoiceNumber={invoice.invoiceNumber}
												/>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing {((currentPage - 1) * INVOICES_PER_PAGE) + 1} to {Math.min(currentPage * INVOICES_PER_PAGE, total)} of {total} invoices
					</p>
					<div className="flex gap-2">
						{currentPage > 1 && (
							<Link href={`/company/${companyId}/invoices?${status ? `status=${status}&` : ''}page=${currentPage - 1}`}>
								<Button variant="outline" size="sm">Previous</Button>
							</Link>
						)}
						{currentPage < totalPages && (
							<Link href={`/company/${companyId}/invoices?${status ? `status=${status}&` : ''}page=${currentPage + 1}`}>
								<Button variant="outline" size="sm">Next</Button>
							</Link>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
