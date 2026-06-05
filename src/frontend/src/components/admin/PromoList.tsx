import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useDeletePromo, useGetAllPromos } from "@/hooks/usePromotions";
import type { Promotion } from "@/types/local";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface PromoListProps {
  onAdd: () => void;
  onEdit: (promo: Promotion) => void;
}

function formatDate(ns: bigint): string {
  return new Date(Number(ns) / 1_000_000).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PromoList({ onAdd, onEdit }: PromoListProps) {
  const { data: promos, isLoading } = useGetAllPromos();
  const deletePromo = useDeletePromo();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<Promotion | null>(null);

  const handleDeleteClick = (promo: Promotion) => {
    setPromoToDelete(promo);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!promoToDelete) return;
    deletePromo.mutate(promoToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setPromoToDelete(null);
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Daftar Promo</h2>
        <Button onClick={onAdd} data-ocid="promo.open_modal_button">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Promo
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="promo.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full animate-pulse" />
          ))}
        </div>
      ) : !promos || promos.length === 0 ? (
        <div
          className="text-center py-12 text-gray-500"
          data-ocid="promo.empty_state"
        >
          Belum ada promo. Klik "Tambah Promo" untuk menambahkan.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Mulai</TableHead>
              <TableHead>Tanggal Berakhir</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promos.map((promo, idx) => (
              <TableRow
                key={promo.id.toString()}
                data-ocid={`promo.item.${idx + 1}`}
              >
                <TableCell className="font-medium">{promo.title}</TableCell>
                <TableCell>
                  {promo.active ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Tidak Aktif</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(promo.startDate)}</TableCell>
                <TableCell>{formatDate(promo.endDate)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(promo)}
                      data-ocid={`promo.edit_button.${idx + 1}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(promo)}
                      disabled={deletePromo.isPending}
                      data-ocid={`promo.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-ocid="promo.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus promo "{promoToDelete?.title}"?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="promo.cancel_button">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletePromo.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="promo.confirm_button"
            >
              {deletePromo.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
