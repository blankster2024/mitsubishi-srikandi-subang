import { useGetPublishedCommercialVehicles } from "@/hooks/useCommercialVehicles";
import type { CommercialVehicle } from "@/types/local";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) return "-";
  return price.toLocaleString("id-ID");
}

function VehicleCardSkeleton() {
  return (
    <div className="rounded-none overflow-hidden shadow-sm bg-white border border-gray-100 h-full flex flex-col animate-pulse w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] flex-shrink-0">
      <div className="overflow-hidden">
        <div className="w-full aspect-video bg-gray-200" />
      </div>
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

export default function HighlightMobilNiaga() {
  const { data: vehicles, isLoading } = useGetPublishedCommercialVehicles();

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

  // Auto-scroll interval — 3500ms (different from HighlightMobilKeluarga's 3000ms)
  useEffect(() => {
    if (!displayVehicles.length || isHovered) return;
    const interval = setInterval(() => {
      if (!scrollRef.current || isResetting.current) return;
      const card = scrollRef.current.querySelector("a");
      const step = card ? card.offsetWidth + 16 : 240;
      scrollRef.current.scrollBy({ left: step, behavior: "smooth" });
    }, 3500);
    return () => clearInterval(interval);
  }, [displayVehicles.length, isHovered]);

  // Initialize scroll to middle segment on mount
  useEffect(() => {
    if (!scrollRef.current || !displayVehicles.length) return;
    const el = scrollRef.current;
    const timeout = setTimeout(() => {
      const segmentWidth = el.scrollWidth / 3;
      el.scrollLeft = segmentWidth;
    }, 50);
    return () => clearTimeout(timeout);
  }, [displayVehicles.length]);

  if (isLoading) {
    return (
      <section className="py-6">
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
    <section className="py-6 overflow-hidden">
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
            data-ocid="niaga.carousel.prev"
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
            {loopedVehicles.map((vehicle: CommercialVehicle, idx: number) => {
              const imgSrc =
                vehicle.mainImages?.[0] ||
                vehicle.heroImage ||
                "/assets/images/placeholder.svg";
              const priceFormatted = formatPrice(vehicle.chassisPrice);
              const categorySlug = vehicle.category
                ? vehicle.category.toLowerCase().replace(/\s+/g, "-")
                : "light-duty";
              return (
                <Link
                  key={`${vehicle.id}-${idx}`}
                  to="/mobil-niaga/$kategori/$slug"
                  params={{ kategori: categorySlug, slug: vehicle.slug }}
                  className="block cursor-pointer group w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] flex-shrink-0"
                  style={{ scrollSnapAlign: "start" }}
                  data-ocid={`niaga.carousel.item.${(idx % displayVehicles.length) + 1}`}
                >
                  <div className="rounded-none overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 h-full flex flex-col">
                    <div className="overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={vehicle.name}
                        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-2 md:p-4 flex flex-col flex-1">
                      <p className="text-sm md:text-base font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-[#FE5E00] transition-colors">
                        {vehicle.name}
                      </p>
                      {vehicle.description && (
                        <p className="text-sm text-gray-500 mt-2 hidden md:line-clamp-2 lg:line-clamp-3 leading-relaxed md:block">
                          {vehicle.description}
                        </p>
                      )}
                      <div className="flex flex-col mt-2">
                        <span className="text-xs md:text-sm text-gray-700">
                          Harga Chassis{" "}
                          <span className="block md:inline">
                            Rp {priceFormatted}
                          </span>
                        </span>
                      </div>
                      <div className="mt-auto pt-2 md:pt-4">
                        <div className="bg-[#333333] text-white text-xs md:text-sm font-semibold w-full py-1.5 md:py-2 rounded-sm group-hover:bg-[#111111] group-hover:text-[#F6C20B] transition-colors text-center">
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
            data-ocid="niaga.carousel.next"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
}
