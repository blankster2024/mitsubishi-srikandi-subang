import { useGetPublishedVehicles } from "@/hooks/useVehicles";
import type { PassengerVehicle } from "@/types/local";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

function VehicleCardSkeleton() {
  return (
    <div className="rounded-none overflow-hidden shadow-sm bg-white border border-gray-100 h-full flex flex-col animate-pulse w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] flex-shrink-0">
      <div className="aspect-video bg-gray-200 w-full" />
      <div className="p-2 md:p-4 flex flex-col flex-1 gap-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full hidden md:block" />
        <div className="h-3 bg-gray-100 rounded w-2/3 hidden md:block" />
        <div className="mt-auto pt-2 md:pt-4">
          <div className="h-7 bg-gray-200 rounded-sm w-full" />
        </div>
      </div>
    </div>
  );
}

export default function HighlightMobilKeluarga() {
  const { data: vehicles, isLoading } = useGetPublishedVehicles();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isResetting = useRef(false);

  const displayVehicles = (vehicles ?? []).slice(0, 8);
  // Infinite loop: original items sandwiched between clones
  const loopedVehicles = [
    ...displayVehicles,
    ...displayVehicles,
    ...displayVehicles,
  ];

  const scrollBy = (direction: "prev" | "next") => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("a");
    const step = card ? card.offsetWidth + 16 : 240;
    scrollRef.current.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  // Silent reset for infinite loop: when we reach clones at start or end,
  // jump back to the middle set without animation
  const handleScroll = () => {
    if (!scrollRef.current || isResetting.current) return;
    const el = scrollRef.current;
    const segmentWidth = el.scrollWidth / 3;
    if (el.scrollLeft < segmentWidth * 0.1) {
      isResetting.current = true;
      el.scrollLeft = el.scrollLeft + segmentWidth;
      requestAnimationFrame(() => {
        isResetting.current = false;
      });
    } else if (el.scrollLeft > segmentWidth * 1.9) {
      isResetting.current = true;
      el.scrollLeft = el.scrollLeft - segmentWidth;
      requestAnimationFrame(() => {
        isResetting.current = false;
      });
    }
  };

  // Auto-scroll interval
  useEffect(() => {
    if (!displayVehicles.length || isHovered) return;
    const interval = setInterval(() => {
      if (!scrollRef.current || isResetting.current) return;
      const card = scrollRef.current.querySelector("a");
      const step = card ? card.offsetWidth + 16 : 240;
      scrollRef.current.scrollBy({ left: step, behavior: "smooth" });
    }, 3000);
    return () => clearInterval(interval);
  }, [displayVehicles.length, isHovered]);

  // Initialize scroll to middle segment on mount
  useEffect(() => {
    if (!scrollRef.current || !displayVehicles.length) return;
    const el = scrollRef.current;
    // Wait for layout
    const timeout = setTimeout(() => {
      const segmentWidth = el.scrollWidth / 3;
      el.scrollLeft = segmentWidth;
    }, 50);
    return () => clearTimeout(timeout);
  }, [displayVehicles.length]);

  if (isLoading) {
    return (
      <section className="py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!displayVehicles.length) return null;

  return (
    <section className="py-6 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Prev button */}
          <button
            type="button"
            onClick={() => scrollBy("prev")}
            aria-label="Sebelumnya"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 transition-opacity duration-200 -translate-x-2 ${isHovered ? "opacity-100" : "opacity-0"}`}
            data-ocid="keluarga.carousel.prev"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide"
            style={{ scrollSnapType: "x mandatory" }}
            onScroll={handleScroll}
          >
            {loopedVehicles.map((vehicle, idx) => {
              const lowestPrice = getLowestVariantPrice(vehicle);
              const variantCount = vehicle.variants?.length ?? 0;
              const desc = vehicle.description ?? "";
              return (
                <Link
                  key={`${vehicle.id.toString()}-${idx}`}
                  to="/mobil-keluarga/$slug"
                  params={{ slug: vehicle.slug }}
                  className="block cursor-pointer group w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] flex-shrink-0"
                  style={{ scrollSnapAlign: "start" }}
                  data-ocid={`keluarga.carousel.item.${(idx % displayVehicles.length) + 1}`}
                >
                  <div className="rounded-none overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 h-full flex flex-col">
                    {/* Image */}
                    <div className="overflow-hidden">
                      <img
                        src={
                          vehicle.heroImageUrl ||
                          "/assets/images/placeholder.svg"
                        }
                        alt={vehicle.vehicleName}
                        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {/* Content */}
                    <div className="p-2 md:p-4 flex flex-col flex-1">
                      <p className="text-sm md:text-base font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-[#CC0000] transition-colors">
                        {vehicle.vehicleName}
                      </p>
                      {desc && (
                        <p className="text-sm text-gray-500 mt-2 hidden md:line-clamp-2 lg:line-clamp-3 leading-relaxed md:block">
                          {desc}
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

          {/* Next button */}
          <button
            type="button"
            onClick={() => scrollBy("next")}
            aria-label="Selanjutnya"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-1.5 transition-opacity duration-200 translate-x-2 ${isHovered ? "opacity-100" : "opacity-0"}`}
            data-ocid="keluarga.carousel.next"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
}
