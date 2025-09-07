"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye } from "lucide-react";
import { UserActivitiesModal } from "./UserActivitiesModal";
import { formatRoleName } from "@/lib/utils/format";

interface User {
  id: number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  emailVerified: number;
  createdAt: string;
  updatedAt: string;
  roles?: Array<{ id: number; name: string }>;
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    name?: string;
    email: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("You don't have permission to view this data");
        }
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleViewActivities = (user: User) => {
    const fullName = user.name || 
      (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
      user.email;
    
    setSelectedUser({
      id: user.id,
      name: fullName,
      email: user.email,
    });
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const displayName = user.name || 
                  (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null);
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {displayName || user.email}
                        </span>
                        {user.roles && user.roles.length > 0 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 font-medium">
                            {user.roles.map(role => formatRoleName(role.name)).join(', ')}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewActivities(user)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Activities
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <UserActivitiesModal
        userId={selectedUser?.id || null}
        userName={selectedUser?.name}
        userEmail={selectedUser?.email}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </>
  );
}