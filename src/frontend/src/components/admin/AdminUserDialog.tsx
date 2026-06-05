import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Principal } from "@dfinity/principal";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type AdminRecord, UserRole } from "../../backend";
import {
  useCreateAdminUser,
  useUpdateAdminUser,
} from "../../hooks/useAdminUsers";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface AdminUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: AdminRecord | null;
}

export default function AdminUserDialog({
  open,
  onClose,
  user,
}: AdminUserDialogProps) {
  const isEdit = user !== null;
  const createUser = useCreateAdminUser();
  const updateUser = useUpdateAdminUser();
  const { identity } = useInternetIdentity();

  const [principalInput, setPrincipalInput] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.admin);
  const [principalError, setPrincipalError] = useState("");

  useEffect(() => {
    if (user) {
      setPrincipalInput(user.principal.toString());
      setRole(user.role);
      setPrincipalError("");
    } else {
      setPrincipalInput("");
      setRole(UserRole.admin);
      setPrincipalError("");
    }
  }, [user]);

  const validatePrincipal = (value: string): boolean => {
    try {
      Principal.fromText(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrincipalError("");

    try {
      if (isEdit) {
        await updateUser.mutateAsync({
          principal: user.principal,
          role,
        });
        toast.success("Role admin berhasil diperbarui");
      } else {
        if (!principalInput.trim()) {
          setPrincipalError("Principal ID wajib diisi");
          return;
        }
        if (!validatePrincipal(principalInput.trim())) {
          setPrincipalError("Format Principal ID tidak valid");
          return;
        }
        const targetPrincipal = Principal.fromText(principalInput.trim());
        await createUser.mutateAsync({
          principal: targetPrincipal,
          role,
        });
        toast.success("Admin user berhasil ditambahkan");
      }
      onClose();
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(error?.message || "Terjadi kesalahan");
    }
  };

  const isPending = createUser.isPending || updateUser.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Role Admin" : "Tambah Admin User Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit ? (
            <div className="space-y-2">
              <Label>Principal ID</Label>
              <div className="text-sm font-mono bg-muted px-3 py-2 rounded-md break-all text-muted-foreground">
                {user.principal.toString()}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="principalId">Principal ID</Label>
              <Input
                id="principalId"
                value={principalInput}
                onChange={(e) => {
                  setPrincipalInput(e.target.value);
                  setPrincipalError("");
                }}
                placeholder="Masukkan Principal ID (contoh: aaaaa-aa)"
                className={principalError ? "border-destructive" : ""}
              />
              {principalError && (
                <p className="text-sm text-destructive">{principalError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Principal ID dari Internet Identity pengguna yang akan dijadikan
                admin
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(val) => setRole(val as UserRole)}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.admin}>Admin</SelectItem>
                <SelectItem value={UserRole.super_admin}>
                  Super Admin
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isEdit && identity && (
            <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
              <span className="font-medium">Principal Anda:</span>{" "}
              <span className="font-mono break-all">
                {identity.getPrincipal().toString()}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
