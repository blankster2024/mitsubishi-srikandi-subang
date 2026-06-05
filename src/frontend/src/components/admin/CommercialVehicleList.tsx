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
import {
  useDeleteCommercialVehicle,
  useGetAllCommercialVehicles,
  useReorderCommercialVehicles,
} from "@/hooks/useCommercialVehicles";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { CommercialVehicle } from "../../types/local";
import CommercialVehicleDialog from "./CommercialVehicleDialog";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCategoryLabel(cat: string): string {
  switch (cat) {
    case "light-duty":
      return "Light Duty";
    case "medium-duty":
      return "Medium Duty";
    case "tractor-head":
      return "Tractor Head";
    default:
      return cat;
  }
}

function formatRupiah(amount: bigint | number): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// ── Sortable row ──────────────────────────────────────────────────────────────

interface SortableRowProps {
  vehicle: CommercialVehicle;
  onEdit: (v: CommercialVehicle) => void;
  onDelete: (v: CommercialVehicle) => void;
  isDeletingPending: boolean;
}

function SortableRow({
  vehicle,
  onEdit,
  onDelete,
  isDeletingPending,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vehicle.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "bg-muted shadow-lg" : ""}
    >
      {/* Drag handle */}
      <TableCell className="w-8 px-2">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
          aria-label="Drag to reorder"
          data-ocid="commercial-vehicle.drag_handle"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>

      <TableCell className="font-medium">{vehicle.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatCategoryLabel(vehicle.category)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {vehicle.subCategory}
      </TableCell>
      <TableCell className="text-sm font-semibold">
        {formatRupiah(vehicle.chassisPrice)}
      </TableCell>
      <TableCell>
        {vehicle.isPublished ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Published
          </Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(vehicle)}
            data-ocid="commercial-vehicle.edit_button"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(vehicle)}
            disabled={isDeletingPending}
            data-ocid="commercial-vehicle.delete_button"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CommercialVehicleList() {
  const { data: rawVehicles, isLoading } = useGetAllCommercialVehicles();
  const deleteVehicle = useDeleteCommercialVehicle();
  const reorderVehicles = useReorderCommercialVehicles();

  const [orderedVehicles, setOrderedVehicles] = useState<CommercialVehicle[]>(
    [],
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] =
    useState<CommercialVehicle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] =
    useState<CommercialVehicle | null>(null);

  // Sync from server whenever rawVehicles changes
  useEffect(() => {
    if (Array.isArray(rawVehicles)) {
      const sorted = [...rawVehicles].sort(
        (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
      );
      setOrderedVehicles(sorted);
    }
  }, [rawVehicles]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleAddClick = () => {
    setEditingVehicle(null);
    setDialogOpen(true);
  };

  const handleEditClick = (vehicle: CommercialVehicle) => {
    setEditingVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleDeleteClick = (vehicle: CommercialVehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!vehicleToDelete) return;
    deleteVehicle.mutate(vehicleToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setVehicleToDelete(null);
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedVehicles.findIndex((v) => v.id === active.id);
    const newIndex = orderedVehicles.findIndex((v) => v.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedVehicles, oldIndex, newIndex);
    setOrderedVehicles(reordered);
    reorderVehicles.mutate(reordered.map((v) => v.id));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Header row with Add button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleAddClick}
          data-ocid="commercial-vehicle.add_button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kendaraan Niaga
        </Button>
      </div>

      {orderedVehicles.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="commercial-vehicle.empty_state"
        >
          <p className="text-base">Belum ada kendaraan niaga.</p>
          <p className="text-sm mt-1">
            Klik tombol "Tambah Kendaraan Niaga" untuk menambahkan.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedVehicles.map((v) => v.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Sub Kategori</TableHead>
                  <TableHead>Harga Chassis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderedVehicles.map((vehicle) => (
                  <SortableRow
                    key={vehicle.id}
                    vehicle={vehicle}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    isDeletingPending={deleteVehicle.isPending}
                  />
                ))}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kendaraan "
              {vehicleToDelete?.name}"?
              <br />
              <br />
              <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="commercial-vehicle-delete.cancel_button">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="commercial-vehicle-delete.confirm_button"
              disabled={deleteVehicle.isPending}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit dialog */}
      <CommercialVehicleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        vehicle={editingVehicle ?? undefined}
      />
    </>
  );
}
