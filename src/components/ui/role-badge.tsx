import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { formatRoleName } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const formattedRole = formatRoleName(role);
  
  // Special styling for Super Admin
  if (role === 'super_admin') {
    return (
      <Badge 
        variant="destructive" 
        className={cn("inline-flex items-center gap-1 w-fit", className)}
      >
        <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" />
        {formattedRole}
      </Badge>
    );
  }
  
  // Styling for other roles
  const getVariant = () => {
    switch (role) {
      case 'manager':
        return 'default';
      case 'employee':
        return 'secondary';
      case 'user':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  return (
    <Badge variant={getVariant()} className={cn("w-fit", className)}>
      {formattedRole}
    </Badge>
  );
}