"use client";

import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Activity, Calendar, Globe, Smartphone, Monitor } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils/date";

interface UserActivity {
	id: number;
	userId: number | null;
	authUserId: string | null;
	activityType: string;
	description: string | null;
	metadata: string | null;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: number;
}

interface UserWithActivities {
	id: number;
	email: string;
	displayName: string | null;
	firstName: string | null;
	lastName: string | null;
	activityCount: number;
	lastActivity: number | null;
}

interface ActivityTableProps {
	users: UserWithActivities[];
}

export function ActivityTable({ users }: ActivityTableProps) {
	const [selectedUser, setSelectedUser] = useState<UserWithActivities | null>(null);
	const [activities, setActivities] = useState<UserActivity[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleViewActivities = async (user: UserWithActivities) => {
		setSelectedUser(user);
		setModalOpen(true);
		setLoading(true);
		
		try {
			const response = await fetch(`/api/admin/users/${user.id}/activities`);
			if (!response.ok) throw new Error("Failed to fetch activities");
			const data = await response.json() as UserActivity[];
			setActivities(data);
		} catch (error) {
			console.error("Error fetching activities:", error);
			setActivities([]);
		} finally {
			setLoading(false);
		}
	};

	const getActivityIcon = (type: string) => {
		switch (type) {
			case 'page_view':
				return <Eye className="h-4 w-4" />;
			case 'login':
			case 'logout':
				return <Activity className="h-4 w-4" />;
			default:
				return <Activity className="h-4 w-4" />;
		}
	};

	const getActivityColor = (type: string) => {
		switch (type) {
			case 'login':
				return 'text-green-600';
			case 'logout':
				return 'text-orange-600';
			case 'page_view':
				return 'text-blue-600';
			case 'error':
				return 'text-red-600';
			default:
				return 'text-gray-600';
		}
	};

	const getDeviceIcon = (userAgent: string | null) => {
		if (!userAgent) return <Monitor className="h-4 w-4" />;
		
		const ua = userAgent.toLowerCase();
		if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
			return <Smartphone className="h-4 w-4" />;
		}
		return <Monitor className="h-4 w-4" />;
	};

	const formatActivityType = (type: string) => {
		return type.split('_').map(word => 
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

	return (
		<>
			<div className="bg-card rounded-lg border">
				<div className="p-4 border-b">
					<h3 className="text-lg font-semibold">User Activity Tracking</h3>
					<p className="text-sm text-muted-foreground mt-1">
						Monitor user interactions and system usage
					</p>
				</div>
				
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Total Activities</TableHead>
							<TableHead>Last Activity</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
									No user data available
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<div>
											<div className="font-medium">
												{getUserDisplayName(user)}
											</div>
											<div className="text-sm text-muted-foreground">
												{user.email}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant={user.activityCount > 0 ? "default" : "secondary"}>
											{user.activityCount} {user.activityCount === 1 ? 'activity' : 'activities'}
										</Badge>
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
			</div>

			{/* Activity Details Modal */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent className="max-w-3xl max-h-[80vh]">
					<DialogHeader>
						<DialogTitle>
							User Activities - {selectedUser ? getUserDisplayName(selectedUser) : ''}
						</DialogTitle>
						<DialogDescription>
							{selectedUser?.email}
						</DialogDescription>
					</DialogHeader>
					
					<ScrollArea className="h-[500px] w-full pr-4">
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-center">
									<Activity className="h-8 w-8 animate-pulse mx-auto mb-2" />
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
							<div className="space-y-4">
								{activities.map((activity) => {
									const metadata = activity.metadata ? JSON.parse(activity.metadata) : null;
									
									return (
										<div key={activity.id} className="border rounded-lg p-4 space-y-3">
											<div className="flex items-start justify-between">
												<div className="flex items-center gap-2">
													<span className={getActivityColor(activity.activityType)}>
														{getActivityIcon(activity.activityType)}
													</span>
													<div>
														<p className="font-medium">
															{formatActivityType(activity.activityType)}
														</p>
														{activity.description && (
															<p className="text-sm text-muted-foreground">
																{activity.description}
															</p>
														)}
													</div>
												</div>
												<span className="text-xs text-muted-foreground">
													{formatDistanceToNow(activity.createdAt)}
												</span>
											</div>
											
											{metadata && (
												<div className="bg-muted/30 rounded p-2 text-xs space-y-1">
													{metadata.page && (
														<div className="flex gap-2">
															<span className="text-muted-foreground">Page:</span>
															<span className="font-mono">{metadata.page}</span>
														</div>
													)}
													{metadata.referrer && (
														<div className="flex gap-2">
															<span className="text-muted-foreground">Referrer:</span>
															<span className="font-mono truncate">{metadata.referrer}</span>
														</div>
													)}
													{metadata.duration && (
														<div className="flex gap-2">
															<span className="text-muted-foreground">Duration:</span>
															<span>{metadata.duration}ms</span>
														</div>
													)}
												</div>
											)}
											
											<div className="flex items-center gap-4 text-xs text-muted-foreground">
												{activity.ipAddress && (
													<div className="flex items-center gap-1">
														<Globe className="h-3 w-3" />
														<span>{activity.ipAddress}</span>
													</div>
												)}
												{activity.userAgent && (
													<div className="flex items-center gap-1">
														{getDeviceIcon(activity.userAgent)}
														<span className="truncate max-w-[200px]" title={activity.userAgent}>
															{activity.userAgent.split(' ')[0]}
														</span>
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}