import PassengerVehicleDialog from "@/components/admin/PassengerVehicleDialog";
import PassengerVehicleList from "@/components/admin/PassengerVehicleList";
import { Button } from "@/components/ui/button";
import type { PassengerVehicle } from "@/types/local";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function PassengerVehiclesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] =
    useState<PassengerVehicle | null>(null);

  const handleAdd = () => {
    setSelectedVehicle(null);
    setDialogOpen(true);
  };

  const handleEdit = (vehicle: PassengerVehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mobil Keluarga</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kendaraan
        </Button>
      </div>

      <PassengerVehicleList onEdit={handleEdit} />

      <PassengerVehicleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
