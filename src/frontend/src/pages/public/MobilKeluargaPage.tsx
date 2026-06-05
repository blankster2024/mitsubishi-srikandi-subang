import { useGetPublishedVehicles } from "@/hooks/useVehicles";
import { Link } from "@tanstack/react-router";
import { Car } from "lucide-react";
import { useState } from "react";

function VehicleCardSkeleton() {
  return (
    <div className="rounded-none overflow-hidden border border-gray-100 h-full flex flex-col animate-pulse">
      <div className="aspect-video bg-gray-200 w-full" />
      <div className="p-3 md:p-5 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full hidden md:block" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
        <div className="h-7 bg-gray-200 rounded w-full mt-auto" />
      </div>
    </div>
  );
}

const TABS = ["Semua", "Passenger", "Commercial"] as const;
type TabValue = (typeof TABS)[number];

export default function MobilKeluargaPage() {
  const { data: vehicles, isLoading } = useGetPublishedVehicles();
  const [activeTab, setActiveTab] = useState<TabValue>("Semua");

  const filteredVehicles =
    !vehicles || activeTab === "Semua"
      ? vehicles
      : vehicles.filter((v) => {
          const vt = (v.vehicleType ?? "").toLowerCase();
          if (activeTab === "Passenger") return vt === "passenger" || vt === "";
          if (activeTab === "Commercial") return vt === "commercial";
          return true;
        });

  return (
    <>
      {/* Hero Section */}
      <section
        aria-label="Hero Mobil Keluarga"
        className="h-[150px] md:h-[250px] bg-[#CC0000] flex items-center justify-center"
      >
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
            <Car
              className="w-6 h-6 md:w-8 md:h-8 text-white"
              aria-hidden="true"
            />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
              Mobil Keluarga
            </h1>
          </div>
          <p className="text-sm md:text-lg max-w-2xl mx-auto opacity-90 text-white">
            Pilihan sempurna untuk keluarga Indonesia dengan kenyamanan,
            keamanan, dan efisiensi terbaik.
          </p>
        </div>
      </section>

      {/* Task B — Full-width outer wrapper; grid container stays max-w-7xl */}
      <div className="w-full">
        <div className="container mx-auto px-4 py-6">
          {/* Task C — Tab Filter */}
          {/* Mobile: dropdown */}
          <div
            className="md:hidden mb-4"
            data-ocid="catalog.filter.tabs.mobile"
          >
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabValue)}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm text-sm font-semibold text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#CC0000] transition-colors cursor-pointer"
                data-ocid="catalog.filter.select"
              >
                {TABS.map((tab) => (
                  <option key={tab} value={tab}>
                    {tab}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                ▾
              </span>
            </div>
          </div>
          {/* Desktop: horizontal tabs */}
          <div
            className="hidden md:flex gap-2 mb-4"
            data-ocid="catalog.filter.tabs"
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-sm transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#CC0000] text-white"
                    : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
                data-ocid={`catalog.tab.${tab.toLowerCase()}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Task D — Redesigned grid + cards */}
          {isLoading ? (
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              data-ocid="vehicles.loading_state"
            >
              {(["sk-1", "sk-2", "sk-3", "sk-4"] as const).map((key) => (
                <VehicleCardSkeleton key={key} />
              ))}
            </div>
          ) : !filteredVehicles || filteredVehicles.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              data-ocid="vehicles.empty_state"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-4 bg-red-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#CC0000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label="Ikon kendaraan"
                  role="img"
                >
                  <title>Ikon kendaraan</title>
                  <path d="M19 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2l2-3h6l2 3h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z" />
                  <circle cx="8.5" cy="13" r="1.5" />
                  <circle cx="15.5" cy="13" r="1.5" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Belum ada kendaraan tersedia
              </h2>
              <p className="text-gray-500 text-sm max-w-xs">
                Kendaraan penumpang akan ditampilkan di sini setelah
                dipublikasikan. Silakan hubungi kami untuk informasi lebih
                lanjut.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredVehicles.map((vehicle, index) => {
                const heroImage =
                  vehicle.heroImageUrl && vehicle.heroImageUrl.length > 0
                    ? vehicle.heroImageUrl
                    : null;
                const variantCount = vehicle.variants
                  ? vehicle.variants.length
                  : 0;

                return (
                  <Link
                    key={vehicle.id.toString()}
                    to="/mobil-keluarga/$slug"
                    params={{ slug: vehicle.slug }}
                    className="block cursor-pointer group"
                    data-ocid={`vehicle.item.${index + 1}`}
                  >
                    <div className="rounded-none overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 h-full flex flex-col">
                      {/* Image */}
                      <div className="overflow-hidden">
                        {heroImage ? (
                          <img
                            src={heroImage}
                            alt={vehicle.vehicleName}
                            className="aspect-video object-cover w-full group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="aspect-video bg-gray-200 w-full" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-2 md:p-4 flex flex-col flex-1">
                        <h3 className="text-sm md:text-base font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-[#CC0000] transition-colors">
                          {vehicle.vehicleName}
                        </h3>

                        <p className="text-sm text-gray-500 mt-2 hidden md:line-clamp-2 lg:line-clamp-3 leading-relaxed md:block">
                          {vehicle.description ?? ""}
                        </p>

                        {/* Price + variants row */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-2">
                          <span className="text-xs md:text-sm text-gray-700">
                            {(vehicle.variants?.[0]?.price ?? 0) > 0 ? (
                              <>
                                Harga mulai Rp&nbsp;
                                {Number(
                                  vehicle.variants?.[0]?.price ?? 0,
                                ).toLocaleString("id-ID")}
                              </>
                            ) : (
                              "—"
                            )}
                          </span>
                          <span className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-0">
                            {variantCount} Varian
                          </span>
                        </div>

                        {/* Button */}
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
          )}
        </div>
      </div>

      {/* CTA Section */}
      <section className="w-full py-16 px-4 bg-[#E0E0E0]">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
          <Car
            width="40"
            height="40"
            className="mb-3"
            stroke="#CC0000"
            aria-hidden="true"
          />
          <h2 className="text-xl md:text-2xl font-bold text-[#333333] mb-3">
            Temukan Mobil Keluarga Terbaik untuk Anda
          </h2>
          <p className="text-gray-500 mb-6 text-sm md:text-base">
            Bandingkan varian dan temukan yang paling sesuai kebutuhan Anda
          </p>
          <Link
            to="/kontak"
            className="inline-block bg-[#CC0000] text-white font-semibold px-8 py-3 rounded hover:bg-[#B30000] transition-colors text-center"
            data-ocid="catalog.cta.button"
          >
            Hubungi Kami
          </Link>
        </div>
      </section>
    </>
  );
}
