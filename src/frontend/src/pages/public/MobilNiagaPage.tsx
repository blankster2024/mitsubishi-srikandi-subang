import {
  useGetCommercialVehicleCountByCategory,
  useGetCommercialVehiclesByCategory,
} from "@/hooks/useCommercialVehicles";
import type { CommercialVehicle } from "@/types/local";
import { Link } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CategoryData {
  slug: string;
  display: string;
  description: string;
  subCategories: string[];
}

const CATEGORIES: CategoryData[] = [
  {
    slug: "light-duty",
    display: "Light Duty",
    description:
      "Kendaraan ringan untuk distribusi dan logistik skala kecil hingga menengah, efisien dan lincah untuk operasional harian.",
    subCategories: ["Economical", "Power", "Speed", "Capacity", "Bus"],
  },
  {
    slug: "medium-duty",
    display: "Medium Duty",
    description:
      "Truk tangguh untuk pengangkutan barang dengan kapasitas menengah hingga besar, andal di berbagai kondisi jalan.",
    subCategories: ["4×2", "6×2", "6×4"],
  },
  {
    slug: "tractor-head",
    display: "Tractor Head",
    description:
      "Kendaraan berat untuk kebutuhan logistik dan transportasi jarak jauh, bertenaga, stabil, efisien bahan bakar dan andal.",
    subCategories: ["4×2", "6×4"],
  },
];

// ── SlideshowImage — isolated slideshow per card ──────────────────────────────

function SlideshowImage({ vehicles }: { vehicles: CommercialVehicle[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images: string[] = vehicles
    .map((v) => v.heroImage || (v.mainImages.length > 0 ? v.mainImages[0] : ""))
    .filter(Boolean);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-[#F6C20B] flex items-center justify-center w-full">
        <Truck className="w-16 h-16 text-black opacity-30" />
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden">
      <img
        src={images[currentIndex]}
        alt="Vehicle"
        className="aspect-video object-cover w-full group-hover:scale-105 transition-transform duration-500"
      />
    </div>
  );
}

// ── CategoryCard — each card manages its own hooks ────────────────────────────

function CategoryCard({ category }: { category: CategoryData }) {
  const { data: count, isLoading: countLoading } =
    useGetCommercialVehicleCountByCategory(category.slug);
  const { data: vehicles = [] } = useGetCommercialVehiclesByCategory(
    category.slug,
  );

  const badge = countLoading ? "..." : `${count ?? 0} Model`;

  return (
    <Link
      to="/mobil-niaga/$kategori"
      params={{ kategori: category.slug }}
      className="block cursor-pointer group h-full"
      data-ocid={`niaga.category.${category.slug}.link`}
    >
      <div
        className="rounded-none overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 h-full flex flex-col"
        data-ocid={`niaga.category.${category.slug}.card`}
      >
        {/* Slideshow image / placeholder */}
        <div className="overflow-hidden relative">
          <SlideshowImage vehicles={vehicles} />
          {/* Count badge */}
          <span className="absolute top-2 right-2 bg-[#F6C20B] text-black text-xs px-2 py-1 rounded-full font-semibold">
            {badge}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-[#FE5E00] transition-colors text-center">
            {category.display}
          </h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed text-center">
            {category.description}
          </p>

          {/* Sub-categories — inline horizontal */}
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-sm text-gray-600">
            {category.subCategories.map((sub, idx) => (
              <span key={sub} className="flex items-center">
                <span>{sub}</span>
                {idx < category.subCategories.length - 1 && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#FE5E00",
                    }}
                    className="ml-2"
                  />
                )}
              </span>
            ))}
          </div>

          {/* Button — mt-auto pushes to bottom */}
          <div className="mt-auto pt-3 md:pt-5">
            <div
              className="bg-[#333333] text-white text-sm md:text-base font-semibold w-full py-2 rounded-sm group-hover:bg-[#111111] group-hover:text-[#F6C20B] transition-colors text-center"
              data-ocid={`niaga.category.${category.slug}.view_button`}
            >
              Lihat Semua Model
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MobilNiagaPage() {
  return (
    <div className="bg-white min-h-screen">
      <main>
        {/* Page Header — hero inside main */}
        <div className="h-[150px] md:h-[250px] bg-[#F6C20B] flex items-center justify-center">
          <div className="text-center px-4">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
              <Truck className="w-8 h-8 md:w-10 md:h-10" />
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                Mobil Niaga Fuso
              </h1>
            </div>
            <p className="text-sm md:text-lg max-w-2xl mx-auto opacity-90">
              Kendaraan komersial tangguh dan efisien untuk mendukung bisnis
              Anda
            </p>
          </div>
        </div>

        {/* Category Grid */}
        <div className="container mx-auto px-4 py-10">
          <h2 className="text-xl md:text-2xl font-bold text-[#333333] mb-3 text-center">
            Andalan Bisnis Sejati
          </h2>
          <p className="text-gray-600 text-center mb-10 text-base">
            Memilih Mitsubishi FUSO adalah sebuah keputusan tepat yang akan
            menjadikan usaha berkembang pesat. Didukung oleh jaringan terluas di
            Indonesia.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <section className="bg-[#E5E7EB] py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-3">
              <Truck size={40} color="#FE5E00" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#333333] mb-3">
              Temukan kendaraan niaga yang tepat untuk bisnis Anda
            </h2>
            <p className="text-gray-500 mb-6 text-sm md:text-base">
              Tim kami siap membantu Anda memilih solusi transportasi terbaik.
            </p>
            <Link
              to="/kontak"
              className="inline-block bg-[#FE5E00] text-white font-semibold px-8 py-3 rounded hover:opacity-90 transition-opacity"
              data-ocid="niaga.cta.hubungi_button"
            >
              Hubungi Kami
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
