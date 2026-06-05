import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { Variant } from "../../types/local";

interface CommercialVariantSelectorProps {
  variants: Variant[];
  onSelectionChange: (variantId: bigint) => void;
}

export default function CommercialVariantSelector({
  variants,
  onSelectionChange,
}: CommercialVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<bigint | null>(
    variants.length > 0 ? variants[0].id : null,
  );

  useEffect(() => {
    if (selectedVariant) {
      onSelectionChange(selectedVariant);
    }
  }, [selectedVariant, onSelectionChange]);

  const handleVariantChange = (variantId: bigint) => {
    setSelectedVariant(variantId);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Pilih Varian</h3>
        <div className="flex flex-wrap gap-2">
          {variants.map((variant) => (
            <Button
              key={variant.id.toString()}
              variant={selectedVariant === variant.id ? "default" : "outline"}
              onClick={() => handleVariantChange(variant.id)}
            >
              {variant.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
