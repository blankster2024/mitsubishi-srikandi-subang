import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { Color, Variant } from "../../types/local";

interface VariantColorSelectorProps {
  variants: Variant[];
  colors: Color[];
  onSelectionChange: (variantId: bigint, colorId: bigint) => void;
}

export default function VariantColorSelector({
  variants,
  colors,
  onSelectionChange,
}: VariantColorSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<bigint | null>(
    variants.length > 0 ? variants[0].id : null,
  );
  const [selectedColor, setSelectedColor] = useState<bigint | null>(
    colors.length > 0 ? colors[0].id : null,
  );

  useEffect(() => {
    if (selectedVariant && selectedColor) {
      onSelectionChange(selectedVariant, selectedColor);
    }
  }, [selectedVariant, selectedColor, onSelectionChange]);

  const handleVariantChange = (variantId: bigint) => {
    setSelectedVariant(variantId);
  };

  const handleColorChange = (colorId: bigint) => {
    setSelectedColor(colorId);
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

      <div>
        <h3 className="text-sm font-medium mb-2">Pilih Warna</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <Button
              key={color.id.toString()}
              variant={selectedColor === color.id ? "default" : "outline"}
              onClick={() => handleColorChange(color.id)}
              className="flex items-center gap-2"
            >
              {color.colorCode && (
                <span
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: color.colorCode }}
                />
              )}
              {color.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
