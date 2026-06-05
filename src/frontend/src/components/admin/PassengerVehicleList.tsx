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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteVehicle,
  useGetAllVehicles,
  useReorderVehicles,
  useToggleVehiclePublishStatus,
} from "@/hooks/useVehicles";
import type { PassengerVehicle } from "@/types/local";
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
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PassengerVehicleListProps {
  onEdit: (vehicle: PassengerVehicle) => void;
}

// ── Sortable row ──────────────────────────────────────────────────────────────
interface SortableRowProps {
  vehicle: PassengerVehicle;
  onEdit: (v: PassengerVehicle) => void;
  onDelete: (v: PassengerVehicle) => void;
  onTogglePublish: (id: bigint) => void;
  isTogglingPublish: boolean;
  isDeletingPending: boolean;
}

function SortableRow({
  vehicle,
  onEdit,
  onDelete,
  onTogglePublish,
  isTogglingPublish,
  isDeletingPending,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vehicle.id.toString() });

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
          data-ocid={`drag-handle-${vehicle.id}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>

      <TableCell className="font-medium">{vehicle.vehicleName}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {vehicle.variants.length} varian
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={vehicle.publishStatus}
            onCheckedChange={() => onTogglePublish(vehicle.id)}
            disabled={isTogglingPublish}
            data-ocid={`toggle-publish-${vehicle.id}`}
          />
          <span className="text-sm">
            {vehicle.publishStatus ? "Dipublikasi" : "Draft"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(vehicle)}
            data-ocid={`btn-edit-vehicle-${vehicle.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(vehicle)}
            disabled={isDeletingPending}
            data-ocid={`btn-delete-vehicle-${vehicle.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PassengerVehicleList({
  onEdit,
}: PassengerVehicleListProps) {
  const { data: rawVehicles, isLoading } = useGetAllVehicles();
  const deleteVehicle = useDeleteVehicle();
  const togglePublishStatus = useToggleVehiclePublishStatus();
  const reorderVehicles = useReorderVehicles();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] =
    useState<PassengerVehicle | null>(null);

  // Local ordered list — initialized from server data, updated on drag
  const [orderedVehicles, setOrderedVehicles] = useState<PassengerVehicle[]>(
    [],
  );

  // Sync from server whenever rawVehicles changes (initial load or after mutations)
  useEffect(() => {
    if (Array.isArray(rawVehicles)) {
      // Sort by displayOrder ascending for consistent display
      const sorted = [...rawVehicles].sort(
        (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
      );
      setOrderedVehicles(sorted);
    }
  }, [rawVehicles]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDeleteClick = (vehicle: PassengerVehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (vehicleToDelete) {
      deleteVehicle.mutate(vehicleToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setVehicleToDelete(null);
        },
      });
    }
  };

  const handleTogglePublish = (vehicleId: bigint) => {
    togglePublishStatus.mutate(vehicleId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedVehicles.findIndex(
      (v) => v.id.toString() === active.id,
    );
    const newIndex = orderedVehicles.findIndex(
      (v) => v.id.toString() === over.id,
    );
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedVehicles, oldIndex, newIndex);
    setOrderedVehicles(reordered);

    // Call backend with new order
    const ids = reordered.map((v) => v.id);
    reorderVehicles.mutate(ids);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (orderedVehicles.length === 0) {
    return (
      <div
        className="text-center py-8 text-muted-foreground"
        data-ocid="vehicles.empty_state"
      >
        Belum ada kendaraan. Klik tombol "Tambah Kendaraan" untuk menambahkan.
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedVehicles.map((v) => v.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Nama Kendaraan</TableHead>
                <TableHead>Varian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderedVehicles.map((vehicle) => (
                <SortableRow
                  key={vehicle.id.toString()}
                  vehicle={vehicle}
                  onEdit={onEdit}
                  onDelete={handleDeleteClick}
                  onTogglePublish={handleTogglePublish}
                  isTogglingPublish={togglePublishStatus.isPending}
                  isDeletingPending={deleteVehicle.isPending}
                />
              ))}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kendaraan "
              {vehicleToDelete?.vehicleName}"?
              <br />
              <br />
              <strong>Peringatan:</strong> Menghapus kendaraan ini juga akan
              menghapus semua data terkait termasuk varian, warna, gambar,
              spesifikasi, dan fitur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="vehicle-delete.cancel_button">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="vehicle-delete.confirm_button"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
