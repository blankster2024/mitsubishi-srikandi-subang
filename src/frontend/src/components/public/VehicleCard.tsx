import type { PassengerVehicle, VehicleVariant } from "@/types/local";
import { Link } from "@tanstack/react-router";

interface VehicleCardProps {
  vehicle: PassengerVehicle;
}

function computeMinPrice(variants: VehicleVariant[]): bigint | null {
  const prices: bigint[] = [];

  for (const variant of variants) {
    if (variant.price > 0n) {
      prices.push(variant.price);
    }
    for (const color of variant.colors) {
      if (color.price > 0n) {
        prices.push(color.price);
      }
    }
  }

  if (prices.length === 0) return null;
  return prices.reduce((min, p) => (p < min ? p : min), prices[0]);
}

function formatIDR(price: bigint): string {
  return new Intl.NumberFormat("id-ID").format(Number(price));
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const minPrice = computeMinPrice(vehicle.variants);
  const slug = vehicle.slug?.trim() ? vehicle.slug : vehicle.id.toString();

  return (
    <div
      className="bg-card overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
      data-ocid="vehicle-card"
    >
      {/* Image */}
      <div className="p-4 bg-white">
        <div className="aspect-video overflow-hidden">
          {vehicle.heroImageUrl ? (
            <img
              src={vehicle.heroImageUrl}
              alt={vehicle.vehicleName}
              className="w-full h-full object-contain scale-110 hover:scale-125 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-xs">
                Tidak ada gambar
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3 flex flex-col flex-1 gap-1.5">
        {/* Name */}
        <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight">
          {vehicle.vehicleName}
        </h3>

        {/* Description — hidden on mobile */}
        {vehicle.description && (
          <p className="hidden sm:block text-xs text-muted-foreground line-clamp-2">
            {vehicle.description}
          </p>
        )}

        {/* Price + Variant count row */}
        <div className="flex justify-between items-center mt-auto pt-1">
          <span
            className="text-xs sm:text-sm font-semibold"
            style={{ color: "#333333" }}
          >
            {minPrice !== null
              ? `Harga mulai: Rp ${formatIDR(minPrice)}`
              : "Hubungi Sales"}
          </span>
          {vehicle.variants.length > 0 && (
            <span className="hidden sm:flex text-xs text-muted-foreground">
              {vehicle.variants.length} Varian
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          to="/mobil-keluarga/$slug"
          params={{ slug }}
          className="block w-full text-center py-2 text-sm font-semibold text-white uppercase rounded-none mt-1 transition-colors duration-200 hover:opacity-90"
          style={{ backgroundColor: "#CC0000" }}
          data-ocid="vehicle-card-detail-btn"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
