import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import type { AdminRecord } from "../../backend";

interface AdminUserListProps {
  users: AdminRecord[];
  isLoading: boolean;
  onEdit: (user: AdminRecord) => void;
  onDelete: (userPrincipal: string) => void;
}

export default function AdminUserList({
  users,
  isLoading,
  onEdit,
  onDelete,
}: AdminUserListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders never reorder
          <Skeleton key={`skeleton-${i}`} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Belum ada admin user
      </div>
    );
  }

  const isLastAdmin = users.length === 1;

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Principal ID</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Dibuat</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.principal.toString()}>
            <TableCell
              className="font-mono text-xs max-w-xs truncate"
              title={user.principal.toString()}
            >
              {user.principal.toString()}
            </TableCell>
            <TableCell>
              <Badge
                variant={user.role === "super_admin" ? "default" : "secondary"}
              >
                {user.role === "super_admin" ? "Super Admin" : "Admin"}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(user.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(user)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(user.principal.toString())}
                  disabled={isLastAdmin}
                  title={
                    isLastAdmin ? "Tidak dapat menghapus admin terakhir" : ""
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
