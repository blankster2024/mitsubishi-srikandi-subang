import PromoDialog from "@/components/admin/PromoDialog";
import PromoList from "@/components/admin/PromoList";
import type { Promotion } from "@/types/local";
import { useState } from "react";

export default function PromosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

  const handleAdd = () => {
    setSelectedPromo(null);
    setDialogOpen(true);
  };

  const handleEdit = (promo: Promotion) => {
    setSelectedPromo(promo);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6" data-ocid="promo.page">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Promo</h1>
      </div>

      <PromoList onAdd={handleAdd} onEdit={handleEdit} />

      <PromoDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        promo={selectedPromo}
      />
    </div>
  );
}
