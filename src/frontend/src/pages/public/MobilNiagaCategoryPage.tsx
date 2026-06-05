import { useGetCommercialVehiclesByCategory } from "@/hooks/useCommercialVehicles";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronDown, Search, Truck } from "lucide-react";
import { useState } from "react";
import type { CommercialVehicle } from "../../types/local";

// ── Static lookup tables ───────────────────────────────────────────────────────

const SUBCATEGORIES: Record<string, string[]> = {
  "light-duty": ["Semua", "Economical", "Power", "Speed", "Capacity", "Bus"],
  "medium-duty": ["Semua", "4×2", "6×2", "6×4"],
  "tractor-head": ["Semua", "4×2", "6×4"],
};

const DISPLAY_NAMES: Record<string, string> = {
  "light-duty": "Light Duty",
  "medium-duty": "Medium Duty",
  "tractor-head": "Tractor Head",
};

const HERO_SUBTITLES: Record<string, string> = {
  "light-duty":
    "Kendaraan ringan untuk distribusi dan logistik skala kecil hingga menengah",
  "medium-duty":
    "Truk tangguh untuk pengangkutan barang dengan kapasitas menengah hingga besar",
  "tractor-head":
    "Kendaraan berat untuk kebutuhan logistik dan transportasi jarak jauh",
};

// ── Vehicle card ──────────────────────────────────────────────────────────────

function VehicleCard({
  vehicle,
  categorySlug,
  index,
}: {
  vehicle: CommercialVehicle;
  categorySlug: string;
  index: number;
}) {
  return (
    <Link
      to="/mobil-niaga/$kategori/$slug"
      params={{ kategori: categorySlug, slug: vehicle.slug }}
      className="block cursor-pointer group"
      data-ocid={`niaga.category.vehicle.item.${index + 1}`}
    >
      <div className="rounded-none overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 h-full flex flex-col">
        {/* Image */}
        <div className="overflow-hidden relative">
          {vehicle.heroImage ? (
            <img
              src={vehicle.heroImage}
              alt={vehicle.name}
              className="aspect-video object-cover w-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="aspect-video bg-[#F6C20B] flex items-center justify-center">
              <Truck className="w-12 h-12 text-black opacity-30" />
            </div>
          )}
          <span className="absolute top-2 right-2 bg-[#F6C20B] text-black text-xs px-2 py-1 rounded-full font-semibold">
            {vehicle.subCategory}
          </span>
        </div>

        {/* Content */}
        <div className="p-2 md:p-4 flex flex-col flex-1">
          <h3 className="text-sm md:text-base font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-[#FE5E00] transition-colors">
            {vehicle.name}
          </h3>
          {vehicle.description && (
            <p className="text-sm text-gray-500 mt-2 hidden md:line-clamp-2 lg:line-clamp-3 leading-relaxed md:block">
              {vehicle.description}
            </p>
          )}
          {Number(vehicle.chassisPrice) > 0 && (
            <p className="mt-2">
              <span className="text-xs md:text-sm text-gray-700">
                Harga Chassis{" "}
                <span className="block md:inline">
                  Rp {Number(vehicle.chassisPrice).toLocaleString("id-ID")}
                </span>
              </span>
            </p>
          )}

          <div className="mt-auto pt-2 md:pt-4">
            <div
              className="bg-[#333333] text-white text-xs md:text-sm font-semibold w-full py-1.5 md:py-2 rounded-sm group-hover:bg-[#111111] group-hover:text-[#F6C20B] transition-colors text-center"
              data-ocid={`niaga.category.vehicle.detail_button.${index + 1}`}
            >
              Lihat Detail
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-none overflow-hidden shadow-sm bg-white border border-gray-100 h-full flex flex-col animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-2 md:p-4 flex flex-col flex-1 gap-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-1" />
        <div className="mt-auto pt-2 md:pt-4">
          <div className="h-8 bg-gray-200 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MobilNiagaCategoryPage() {
  const { kategori } = useParams({ from: "/mobil-niaga/$kategori" });
  const categorySlug = kategori ?? "";

  const { data: vehicles = [], isLoading } =
    useGetCommercialVehiclesByCategory(categorySlug);

  const subCategories = SUBCATEGORIES[categorySlug] ?? ["Semua"];
  const displayName = DISPLAY_NAMES[categorySlug] ?? categorySlug;
  const heroSubtitle =
    HERO_SUBTITLES[categorySlug] ??
    "Mitsubishi Fuso — Pilihan Kendaraan Niaga Terbaik";

  const [selectedSubCategory, setSelectedSubCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filtered = vehicles.filter((v) => {
    const matchesSub =
      selectedSubCategory === "Semua" || v.subCategory === selectedSubCategory;
    const matchesSearch =
      !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSub && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen">
      <main>
        {/* Hero — inside main */}
        <div className="h-[150px] md:h-[250px] bg-[#F6C20B] flex items-center justify-center">
          <div className="text-center px-4">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
              <Truck className="w-8 h-8 md:w-10 md:h-10 text-black" />
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-black">
                {displayName}
              </h1>
            </div>
            <p className="text-sm md:text-lg max-w-2xl mx-auto opacity-90 text-black/80">
              {heroSubtitle}
            </p>
          </div>
        </div>

        {/* Filter pills + Search bar */}
        <div className="container mx-auto px-4 pt-6 flex items-center justify-between gap-4">
          {/* ── Mobile: Dropdown filter ── */}
          <div className="relative md:hidden flex-1">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center justify-between w-full px-4 py-2 rounded-sm border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              data-ocid="niaga.category.filter.dropdown_toggle"
            >
              <span>{selectedSubCategory}</span>
              <ChevronDown
                className={`w-4 h-4 ml-2 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown list */}
            <div
              className={`absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg z-20 overflow-hidden transition-all duration-200 ease-out origin-top ${
                isDropdownOpen
                  ? "opacity-100 scale-y-100 translate-y-0"
                  : "opacity-0 scale-y-0 -translate-y-2 pointer-events-none"
              }`}
            >
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setSelectedSubCategory(sub);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    selectedSubCategory === sub
                      ? "bg-[#FE5E00] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  data-ocid={`niaga.category.filter.${sub.replace(/[×\s]/g, "-").toLowerCase()}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* ── Desktop: Horizontal tab filter ── */}
          <div className="hidden md:flex overflow-x-auto flex-1">
            <div className="flex gap-2 w-max">
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-sm text-sm font-medium transition-colors ${
                    selectedSubCategory === sub
                      ? "bg-[#FE5E00] text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                  data-ocid={`niaga.category.filter.${sub.replace(/[×\s]/g, "-").toLowerCase()}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar — styled display bar on mobile, full input on desktop */}
          <div className="relative flex items-center flex-shrink-0">
            {/* Mobile: styled bar with icon + placeholder text */}
            <button
              type="button"
              className="md:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-sm bg-white cursor-pointer w-40 text-gray-400 text-sm"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              data-ocid="niaga.category.search_toggle"
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Cari kendaraan…</span>
            </button>

            {/* Expandable input on mobile */}
            {isSearchOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 md:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari kendaraan…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-sm text-sm w-56 focus:outline-none focus:border-[#FE5E00] bg-white shadow-md"
                    data-ocid="niaga.category.search_input_mobile"
                  />
                </div>
              </div>
            )}

            {/* Desktop: always visible search bar */}
            <div className="hidden md:block relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kendaraan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-sm text-sm w-full focus:outline-none focus:border-[#FE5E00]"
                data-ocid="niaga.category.search_input"
              />
            </div>
          </div>
        </div>

        {/* Vehicle grid */}
        <div className="container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="py-20 text-center"
              data-ocid="niaga.category.empty_state"
            >
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                Tidak ada kendaraan ditemukan
              </p>
              {(searchQuery || selectedSubCategory !== "Semua") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubCategory("Semua");
                  }}
                  className="mt-4 text-sm text-[#FE5E00] underline"
                >
                  Reset filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((vehicle, idx) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  categorySlug={categorySlug}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <section className="bg-[#E5E7EB] py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-3">
              <Truck className="w-10 h-10 text-[#FE5E00]" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#333333] mb-3">
              Butuh bantuan memilih kendaraan niaga?
            </h2>
            <p className="text-gray-500 mb-6 text-sm md:text-base">
              Tim sales kami siap membantu Anda menemukan solusi terbaik.
            </p>
            <Link
              to="/kontak"
              className="inline-block bg-[#FE5E00] text-white font-semibold px-8 py-3 rounded hover:opacity-90 transition-opacity"
              data-ocid="niaga.category.cta.hubungi_button"
            >
              Hubungi Kami
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
