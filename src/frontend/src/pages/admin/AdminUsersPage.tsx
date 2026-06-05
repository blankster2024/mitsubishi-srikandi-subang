import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AdminRecord } from "../../backend";
import AdminUserDialog from "../../components/admin/AdminUserDialog";
import AdminUserList from "../../components/admin/AdminUserList";
import {
  useDeleteAdminUser,
  useGetAllAdminUsers,
} from "../../hooks/useAdminUsers";

export default function AdminUsersPage() {
  const { data: users, isLoading, refetch } = useGetAllAdminUsers();
  const deleteUser = useDeleteAdminUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminRecord | null>(null);

  const handleEdit = (user: AdminRecord) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDelete = async (principalId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus admin user ini?")) return;

    try {
      await deleteUser.mutateAsync(principalId);
      toast.success("Admin user berhasil dihapus");
    } catch (error: any) {
      toast.error(error?.message || "Gagal menghapus admin user");
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Users</h1>
          <p className="text-muted-foreground">Kelola pengguna admin</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Admin User
        </Button>
      </div>

      <AdminUserList
        users={users || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AdminUserDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        user={selectedUser}
      />
    </div>
  );
}
