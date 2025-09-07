"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Activity {
  id: number;
  action: string;
  info: string;
  createdAt: string;
}

interface UserActivitiesModalProps {
  userId: number | null;
  userName?: string;
  userEmail?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserActivitiesModal({
  userId,
  userName,
  userEmail,
  isOpen,
  onClose,
}: UserActivitiesModalProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserActivities();
    }
  }, [isOpen, userId]);

  const fetchUserActivities = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/activities`);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You don't have permission to view this data");
        }
        throw new Error("Failed to fetch activities");
      }
      
      const data = await response.json();
      // Show all activities
      setActivities(data.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("login")) return "bg-green-500";
    if (action.includes("logout")) return "bg-gray-500";
    if (action.includes("create") || action.includes("add")) return "bg-blue-500";
    if (action.includes("update") || action.includes("edit")) return "bg-yellow-500";
    if (action.includes("delete") || action.includes("remove")) return "bg-red-500";
    if (action.includes("view") || action.includes("page_view")) return "bg-purple-500";
    return "bg-gray-400";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>User Activities: {userName || userEmail}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities found for this user
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left pb-2 font-medium text-sm">Action</th>
                    <th className="text-left pb-2 font-medium text-sm">Details</th>
                    <th className="text-left pb-2 font-medium text-sm">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-muted/50">
                      <td className="py-3">
                        <Badge className={`${getActionColor(activity.action)} text-white`}>
                          {activity.action.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-muted-foreground">
                          {activity.info.replace(/Visited:\s*/, '').replace(/\s*\(.*?\)$/, '')}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-muted-foreground">
                          {(() => {
                            if (!activity.createdAt) return "";
                            try {
                              const date = new Date(activity.createdAt);
                              if (isNaN(date.getTime())) return "";
                              return format(date, "MMM d, h:mm a");
                            } catch {
                              return "";
                            }
                          })()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}