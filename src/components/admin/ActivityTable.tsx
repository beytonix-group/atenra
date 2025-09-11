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
	DialogDescription 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Activity, Calendar, Globe, Smartphone, Monitor, Loader2, ChevronLeft, ChevronRight, FileText, User, Shield } from "lucide-react";
import { formatDistanceToNow, formatDate } from "@/lib/utils/date";
import { toast } from "sonner";

interface UserActivity {
	id: number;
	action: string;
	timestamp: number;
	info: {
		message?: string;
		path?: string;
		method?: string;
		statusCode?: number;
		clientTimestamp?: number;
		fieldsUpdated?: string[];
		userCount?: number;
		targetUserId?: number;
		targetUserEmail?: string;
		activitiesCount?: number;
		duration?: string;
		error?: string;
		query?: Record<string, string>;
		userAgent?: string;
	};
}

interface UserWithActivities {
	id: number;
	email: string;
	displayName: string | null;
	firstName: string | null;
	lastName: string | null;
	roles?: { roleId: number; roleName: string }[];
	activityCount?: number;
	lastActivity?: number | null;
}

interface ActivityTableProps {
	users: UserWithActivities[];
	searchTerm?: string;
}

const ITEMS_PER_PAGE = 10;

export function ActivityTable({ users, searchTerm = "" }: ActivityTableProps) {
	const [selectedUser, setSelectedUser] = useState<UserWithActivities | null>(null);
	const [activities, setActivities] = useState<UserActivity[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [hasMore, setHasMore] = useState(false);

	const fetchActivities = async (userId: number, page: number) => {
		setLoading(true);
		const offset = (page - 1) * ITEMS_PER_PAGE;
		
		try {
			const response = await fetch(
				`/api/admin/users/${userId}/activities?limit=${ITEMS_PER_PAGE}&offset=${offset}`
			);
			if (!response.ok) {
				throw new Error("Failed to fetch activities");
			}
			const data = await response.json() as { 
				activities?: UserActivity[];
				pagination?: {
					total: number;
					hasMore: boolean;
				};
			};
			setActivities(data.activities || []);
			setTotalCount(data.pagination?.total || 0);
			setHasMore(data.pagination?.hasMore || false);
		} catch (error) {
			console.error("Error fetching activities:", error);
			toast.error("Failed to load user activities");
			setActivities([]);
			setTotalCount(0);
			setHasMore(false);
		} finally {
			setLoading(false);
		}
	};

	const handleViewActivities = async (user: UserWithActivities) => {
		setSelectedUser(user);
		setCurrentPage(1);
		setModalOpen(true);
		await fetchActivities(user.id, 1);
	};

	const handlePageChange = async (newPage: number) => {
		if (!selectedUser || loading) return;
		setCurrentPage(newPage);
		await fetchActivities(selectedUser.id, newPage);
	};

	const getActivityIcon = (action: string) => {
		if (action === 'page_visit') return <Eye className="h-3 w-3" />;
		if (action.includes('api')) return <Globe className="h-3 w-3" />;
		if (action.includes('profile')) return <User className="h-3 w-3" />;
		if (action.includes('admin')) return <Shield className="h-3 w-3" />;
		if (action.includes('document')) return <FileText className="h-3 w-3" />;
		return <Activity className="h-3 w-3" />;
	};

	const getActivityColor = (action: string) => {
		if (action.includes('error')) return 'text-red-600';
		if (action.includes('admin')) return 'text-purple-600';
		if (action.includes('update') || action.includes('create')) return 'text-green-600';
		if (action.includes('delete')) return 'text-orange-600';
		if (action === 'page_visit') return 'text-blue-600';
		if (action === 'api_call') return 'text-cyan-600';
		return 'text-gray-600';
	};

	const getDeviceIcon = (userAgent?: string) => {
		if (!userAgent) return <Monitor className="h-3 w-3" />;
		
		const ua = userAgent.toLowerCase();
		if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
			return <Smartphone className="h-3 w-3" />;
		}
		return <Monitor className="h-3 w-3" />;
	};

	const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
	const startItem = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
	const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

	const formatActivityAction = (action: string) => {
		return action.split('_').map(word => 
			word.charAt(0).toUpperCase() + word.slice(1)
		).join(' ');
	};

	const getUserDisplayName = (user: UserWithActivities) => {
		if (user.displayName) return user.displayName;
		if (user.firstName || user.lastName) {
			return `${user.firstName || ''} ${user.lastName || ''}`.trim();
		}
		return user.email.split('@')[0];
	};
	
	// Filter users based on search term
	const filteredUsers = users.filter(user => {
		if (!searchTerm) return true;
		const search = searchTerm.toLowerCase();
		const displayName = getUserDisplayName(user).toLowerCase();
		return displayName.includes(search) || user.email.toLowerCase().includes(search);
	});

	return (
		<>
			<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Last Activity</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredUsers.length === 0 ? (
							<TableRow>
								<TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
									{searchTerm ? "No users found matching your search" : "No user data available"}
								</TableCell>
							</TableRow>
						) : (
							filteredUsers.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<div>
											<div className="font-medium">
												{getUserDisplayName(user)}
											</div>
										</div>
									</TableCell>
									<TableCell>
										{user.lastActivity ? (
											<div className="flex items-center gap-2 text-sm">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												{formatDistanceToNow(user.lastActivity)}
											</div>
										) : (
											<span className="text-sm text-muted-foreground">No activity</span>
										)}
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleViewActivities(user)}
										>
											<Eye className="h-4 w-4 mr-2" />
											View Activities
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

			{/* Activity Details Modal */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							<span>User Activities - {selectedUser ? getUserDisplayName(selectedUser) : ''}</span>
						</DialogTitle>
					</DialogHeader>
					
					<div className="border rounded-md overflow-hidden">
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-center">
									<Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
									<p className="text-sm text-muted-foreground">Loading activities...</p>
								</div>
							</div>
						) : activities.length === 0 ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-center">
									<Activity className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
									<p className="text-sm text-muted-foreground">No activities recorded</p>
								</div>
							</div>
						) : (
							<Table className="table-fixed">
								<TableHeader>
									<TableRow className="h-10">
										<TableHead className="w-[160px] py-2">Action</TableHead>
										<TableHead className="py-2">Description</TableHead>
										<TableHead className="w-[180px] py-2">Date</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{activities.map((activity) => {
										// Build description from activity info
										let description = activity.info?.message || '';
										if (activity.info?.path) {
											description = activity.info.path;
										}
										if (activity.info?.targetUserEmail) {
											description = `User: ${activity.info.targetUserEmail}`;
										}
										if (activity.info?.fieldsUpdated && activity.info.fieldsUpdated.length > 0) {
											description = `Updated: ${activity.info.fieldsUpdated.join(', ')}`;
										}
										if (activity.info?.error) {
											description = `Error: ${activity.info.error}`;
										}
										
										return (
											<TableRow key={activity.id} className="h-10">
												<TableCell className="py-2">
													<div className="flex items-center gap-1.5">
														<span className={getActivityColor(activity.action)}>
															{getActivityIcon(activity.action)}
														</span>
														<span className="text-xs font-medium">
															{formatActivityAction(activity.action)}
														</span>
													</div>
												</TableCell>
												<TableCell className="py-2">
													<span className="text-xs text-muted-foreground truncate block" title={description}>
														{description || '-'}
													</span>
												</TableCell>
												<TableCell className="py-2">
													<span className="text-xs text-muted-foreground">
														{formatDate(activity.timestamp)}
													</span>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						)}
					</div>
					
					{/* Pagination Controls */}
					{totalCount > 0 && (
						<div className="flex items-center justify-between border-t pt-4">
							<div className="text-sm text-muted-foreground">
								Showing {startItem}-{endItem} of {totalCount} activities
							</div>
							{totalCount > ITEMS_PER_PAGE && (
								<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1 || loading}
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>
								
								{/* Page number buttons */}
								<div className="flex items-center gap-1">
									{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
										let pageNum;
										if (totalPages <= 5) {
											pageNum = i + 1;
										} else if (currentPage <= 3) {
											pageNum = i + 1;
										} else if (currentPage >= totalPages - 2) {
											pageNum = totalPages - 4 + i;
										} else {
											pageNum = currentPage - 2 + i;
										}
										return (
											<Button
												key={pageNum}
												variant={currentPage === pageNum ? "default" : "outline"}
												size="sm"
												className="w-10"
												onClick={() => handlePageChange(pageNum)}
												disabled={loading}
											>
												{pageNum}
											</Button>
										);
									})}
								</div>
								
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={!hasMore || loading}
								>
									Next
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}