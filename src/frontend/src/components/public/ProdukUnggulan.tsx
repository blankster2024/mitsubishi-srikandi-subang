import { useGetPublishedVehicles } from "@/hooks/useVehicles";
import type { PassengerVehicle } from "@/types/local";
import { Link } from "@tanstack/react-router";

function formatPrice(price: bigint | number | undefined): string {
  if (price === undefined || price === null) return "-";
  const num = typeof price === "bigint" ? Number(price) : price;
  return num.toLocaleString("id-ID");
}

function getLowestVariantPrice(vehicle: PassengerVehicle): bigint | undefined {
  if (!vehicle.variants || vehicle.variants.length === 0) return undefined;
  return vehicle.variants.reduce(
    (min, v) => (v.price < min ? v.price : min),
    vehicle.variants[0].price,
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-none overflow-hidden shadow-sm bg-white border border-gray-100 h-full flex flex-col animate-pulse">
      <div className="aspect-video bg-gray-200 w-full" />
      <div className="p-2 md:p-4 flex flex-col flex-1 gap-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full hidden md:block" />
        <div className="h-3 bg-gray-100 rounded w-2/3 hidden md:block" />
        <div className="flex flex-col md:flex-row md:justify-between mt-2">
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/4 mt-0.5 md:mt-0" />
        </div>
        <div className="mt-auto pt-2 md:pt-4">
          <div className="h-7 bg-gray-200 rounded-sm w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProdukUnggulan() {
  const { data: vehicles, isLoading } = useGetPublishedVehicles();
  const featuredVehicles = (vehicles ?? []).slice(0, 4);

  return (
    <section className="py-10 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-[#333333] mb-3 md:mb-5 text-center">
          Produk Terlaris
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
            : featuredVehicles.map((vehicle) => {
                const lowestPrice = getLowestVariantPrice(vehicle);
                const variantCount = vehicle.variants?.length ?? 0;
                return (
                  <Link
                    key={vehicle.id.toString()}
                    to="/mobil-keluarga/$slug"
                    params={{ slug: vehicle.slug }}
                    className="block cursor-pointer group"
                    data-ocid={`unggulan.item.${featuredVehicles.indexOf(vehicle) + 1}`}
                  >
                    <div className="rounded-none overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 h-full flex flex-col">
                      <div className="overflow-hidden">
                        <img
                          src={
                            vehicle.heroImageUrl ||
                            "/assets/images/placeholder.svg"
                          }
                          alt={vehicle.vehicleName}
                          className="aspect-video object-cover w-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-2 md:p-4 flex flex-col flex-1">
                        <p className="text-sm md:text-base font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-[#CC0000] transition-colors">
                          {vehicle.vehicleName}
                        </p>
                        {vehicle.description && (
                          <p className="text-sm text-gray-500 mt-2 hidden md:line-clamp-2 lg:line-clamp-3 leading-relaxed md:block">
                            {vehicle.description}
                          </p>
                        )}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-2">
                          <span className="text-xs md:text-sm text-gray-700">
                            {lowestPrice !== undefined
                              ? `Harga mulai Rp ${formatPrice(lowestPrice)}`
                              : "Hubungi dealer"}
                          </span>
                          {variantCount > 0 && (
                            <span className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-0">
                              {variantCount} Varian
                            </span>
                          )}
                        </div>
                        <div className="mt-auto pt-2 md:pt-4">
                          <div className="bg-[#CC0000] text-white text-xs md:text-sm font-semibold w-full py-1.5 md:py-2 rounded-sm group-hover:bg-[#B30000] transition-colors text-center">
                            Lihat Detail
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
