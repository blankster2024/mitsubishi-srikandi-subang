import CommercialVehicleList from "@/components/admin/CommercialVehicleList";

export default function CommercialVehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Kendaraan Niaga</h1>
      </div>

      <CommercialVehicleList />
    </div>
  );
}
