"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, RefreshCw, Activity, User, Calendar, Info } from "lucide-react";
import { ACTIVITY_TYPES } from "@/lib/activity-tracker";

interface UserActivity {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  action: string;
  info: string;
  createdAt: string;
}

export function ActivitiesView() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/activities");
      if (!response.ok) throw new Error("Failed to fetch activities");
      const data = await response.json() as UserActivity[];
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Filter activities based on search and filters
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      searchQuery === "" ||
      activity.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.info.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = 
      actionFilter === "all" || 
      activity.action === actionFilter;

    const matchesTime = (() => {
      if (timeFilter === "all") return true;
      const activityDate = new Date(activity.createdAt);
      const now = new Date();
      
      switch (timeFilter) {
        case "today":
          return activityDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return activityDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return activityDate >= monthAgo;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesAction && matchesTime;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case ACTIVITY_TYPES.PAGE_VIEW:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case ACTIVITY_TYPES.USER_ACTION:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case ACTIVITY_TYPES.FORM_SUBMIT:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case ACTIVITY_TYPES.API_CALL:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case ACTIVITY_TYPES.ERROR:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value={ACTIVITY_TYPES.PAGE_VIEW}>Page Views</SelectItem>
              <SelectItem value={ACTIVITY_TYPES.USER_ACTION}>User Actions</SelectItem>
              <SelectItem value={ACTIVITY_TYPES.FORM_SUBMIT}>Form Submissions</SelectItem>
              <SelectItem value={ACTIVITY_TYPES.API_CALL}>API Calls</SelectItem>
              <SelectItem value={ACTIVITY_TYPES.ERROR}>Errors</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchActivities} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
              <p className="text-2xl font-bold">{activities.length}</p>
            </div>
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Page Views</p>
              <p className="text-2xl font-bold">
                {activities.filter(a => a.action === ACTIVITY_TYPES.PAGE_VIEW).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">User Actions</p>
              <p className="text-2xl font-bold">
                {activities.filter(a => a.action === ACTIVITY_TYPES.USER_ACTION).length}
              </p>
            </div>
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold">
                {activities.filter(a => a.action === ACTIVITY_TYPES.ERROR).length}
              </p>
            </div>
            <Info className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-card border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading activities...
                </TableCell>
              </TableRow>
            ) : filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No activities found
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {activity.userName || "Unknown User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {activity.userEmail || `User ID: ${activity.userId}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getActionBadgeColor(activity.action)}`}>
                      {activity.action.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <span className="text-sm truncate">
                      {activity.info}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}