import { useGetPublishedCommercialVehicles } from "@/hooks/useCommercialVehicles";
import { Link, useParams } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Phone,
  Truck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CommercialVehicle } from "../../types/local";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: bigint | number): string {
  return `Rp. ${Number(price).toLocaleString("id-ID")}`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="bg-white">
      <div className="h-[150px] md:h-[250px] bg-gray-200 animate-pulse w-full" />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-start gap-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="aspect-video bg-gray-200 rounded-xl w-full" />
      </div>
    </div>
  );
}

// ── Slideshow ─────────────────────────────────────────────────────────────────

function Slideshow({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef(images.length);
  countRef.current = images.length;

  // Move interval setup into a stable ref-based approach
  const scheduleNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % countRef.current);
    }, 4500);
  };

  const navigateTo = (idx: number) => {
    setCurrent(idx);
    scheduleNext();
  };

  const handlePrev = () =>
    navigateTo((current - 1 + images.length) % images.length);
  const handleNext = () => navigateTo((current + 1) % images.length);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scheduleNext is stable per render
  useEffect(() => {
    if (images.length > 1) scheduleNext();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-[#F6C20B] rounded-xl flex items-center justify-center">
        <Truck className="w-16 h-16 text-black opacity-30" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl">
        <img
          src={images[current]}
          alt={`Gambar ${current + 1}`}
          className="aspect-video object-cover w-full transition-opacity duration-300"
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
            data-ocid="niaga.detail.slideshow.prev_button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
            data-ocid="niaga.detail.slideshow.next_button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex justify-center gap-2 mt-3">
            {images.map((imgUrl, idx) => (
              <button
                key={imgUrl}
                type="button"
                onClick={() => navigateTo(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  idx === current ? "bg-[#FE5E00]" : "bg-gray-300"
                }`}
                data-ocid={`niaga.detail.slideshow.dot.${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Related vehicle card ──────────────────────────────────────────────────────

function RelatedCard({
  vehicle,
  categorySlug,
}: {
  vehicle: CommercialVehicle;
  categorySlug: string;
}) {
  return (
    <div className="flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(25%-12px)] rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100 flex flex-col">
      <div className="overflow-hidden relative">
        {vehicle.heroImage ? (
          <img
            src={vehicle.heroImage}
            alt={vehicle.name}
            className="aspect-video object-cover w-full hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="aspect-video bg-[#F6C20B] flex items-center justify-center">
            <Truck className="w-8 h-8 text-black opacity-30" />
          </div>
        )}
        <span className="absolute top-2 right-2 bg-[#F6C20B] text-black text-xs px-2 py-1 rounded-full font-semibold">
          {vehicle.subCategory}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#FE5E00] transition-colors">
          {vehicle.name}
        </h4>
        {Number(vehicle.chassisPrice) > 0 && (
          <p className="text-xs font-semibold text-[#FE5E00] mt-1">
            {formatPrice(Number(vehicle.chassisPrice))}
          </p>
        )}
        <div className="mt-auto pt-3">
          <Link
            to="/mobil-niaga/$kategori/$slug"
            params={{ kategori: categorySlug, slug: vehicle.slug }}
            className="block bg-[#333333] text-white text-xs px-3 py-1.5 rounded hover:text-[#FE5E00] transition-colors w-full text-center"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MobilNiagaDetailPage() {
  const { kategori, slug } = useParams({
    from: "/mobil-niaga/$kategori/$slug",
  });
  const categorySlug = kategori ?? "";
  const vehicleSlug = slug ?? "";

  const {
    data: vehicles,
    isLoading,
    isPending,
  } = useGetPublishedCommercialVehicles();

  if (isLoading || isPending || vehicles === undefined)
    return <DetailSkeleton />;

  const vehicle =
    vehicles?.find(
      (v) =>
        v.slug === vehicleSlug &&
        v.category.toLowerCase() === categorySlug.toLowerCase(),
    ) ?? null;

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#333333] mb-2">
          Kendaraan tidak ditemukan
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Kendaraan yang Anda cari tidak tersedia atau telah dihapus.
        </p>
        <Link
          to="/mobil-niaga"
          className="inline-block bg-[#333333] text-white px-6 py-2.5 rounded hover:opacity-90 transition-opacity text-sm"
          data-ocid="niaga.detail.back_button"
        >
          Kembali ke Kendaraan Niaga
        </Link>
      </div>
    );
  }

  const related = (vehicles ?? [])
    .filter(
      (v) =>
        v.category.toLowerCase() === categorySlug.toLowerCase() &&
        v.id !== vehicle.id,
    )
    .slice(0, 8);

  return (
    <div className="bg-white">
      <main>
        {/* Section 1 — Hero */}
        <section
          className="relative h-[150px] md:h-[250px] overflow-hidden"
          data-ocid="niaga.detail.hero_section"
        >
          {vehicle.heroImage ? (
            <>
              <img
                src={vehicle.heroImage}
                alt={vehicle.heroTitle || vehicle.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                {vehicle.heroTitle && (
                  <h2 className="text-xl md:text-3xl font-bold text-white drop-shadow">
                    {vehicle.heroTitle}
                  </h2>
                )}
                {vehicle.heroSubtext && (
                  <p className="text-sm md:text-base text-gray-200 mt-2 drop-shadow">
                    {vehicle.heroSubtext}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="h-full bg-[#F6C20B] flex flex-col items-center justify-center text-center px-4">
              {vehicle.heroTitle ? (
                <>
                  <h2 className="text-xl md:text-3xl font-bold text-black">
                    {vehicle.heroTitle}
                  </h2>
                  {vehicle.heroSubtext && (
                    <p className="text-sm md:text-base text-gray-700 mt-2">
                      {vehicle.heroSubtext}
                    </p>
                  )}
                </>
              ) : (
                <h2 className="text-xl md:text-3xl font-bold text-black">
                  {vehicle.name}
                </h2>
              )}
            </div>
          )}
        </section>

        {/* Section 2 — Name & Consultation */}
        <section className="max-w-7xl mx-auto px-4 pt-6">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#333333] leading-tight">
              {vehicle.name}
            </h1>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-[#FE5E00] text-white px-6 py-2 rounded font-semibold text-sm hover:opacity-90 transition-opacity"
              data-ocid="niaga.detail.konsultasi_button"
            >
              Konsultasi
            </a>
          </div>
        </section>

        {/* Section 3 — Chassis price */}
        {Number(vehicle.chassisPrice) > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-2">
            <p className="text-xl font-bold text-[#FE5E00]">
              {formatPrice(Number(vehicle.chassisPrice))}
            </p>
          </section>
        )}

        {/* Section 4 — Description */}
        {vehicle.description && (
          <section className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-gray-600 leading-relaxed">
              {vehicle.description}
            </p>
          </section>
        )}

        {/* Section 5 — Slideshow */}
        {(vehicle.mainImages ?? []).length > 0 && (
          <section
            className="max-w-7xl mx-auto px-4 py-6"
            data-ocid="niaga.detail.slideshow_section"
          >
            <Slideshow images={vehicle.mainImages ?? []} />
          </section>
        )}

        {/* Section 6 — Chassis & Cabin images */}
        {vehicle.chassisImage && (
          <section className="max-w-7xl mx-auto px-4 py-6">
            {vehicle.cabinImage ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Gambar Chassis
                  </p>
                  <img
                    src={vehicle.chassisImage}
                    alt="Chassis"
                    className="object-cover rounded-xl w-full aspect-video"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Gambar Kabin
                  </p>
                  <img
                    src={vehicle.cabinImage}
                    alt="Kabin"
                    className="object-cover rounded-xl w-full aspect-video"
                  />
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Gambar Chassis
                </p>
                <img
                  src={vehicle.chassisImage}
                  alt="Chassis"
                  className="object-cover rounded-xl w-full aspect-video"
                />
              </div>
            )}
          </section>
        )}

        {/* Section 7 — CTA */}
        <section className="bg-[#E5E7EB] py-10">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-[#333333] text-base md:text-lg font-medium mb-6">
              Untuk mendapatkan harga promo dan konsultasi pembelian, jangan
              ragu untuk menghubungi kami.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#FE5E00] text-white px-6 py-2.5 rounded font-semibold text-sm hover:opacity-90 transition-opacity"
                data-ocid="niaga.detail.cta.hubungi_sales_button"
              >
                <Phone className="w-4 h-4" />
                Hubungi Sales
              </a>
              <Link
                to="/simulasi-kredit"
                className="flex items-center gap-2 bg-[#333333] text-white px-6 py-2.5 rounded font-semibold text-sm hover:opacity-90 transition-opacity"
                data-ocid="niaga.detail.cta.simulasi_button"
              >
                Simulasi Kredit
              </Link>
              {vehicle.brochureUrl ? (
                <a
                  href={vehicle.brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#333333] text-white px-6 py-2.5 rounded font-semibold text-sm hover:opacity-90 transition-opacity"
                  data-ocid="niaga.detail.cta.download_brosur_button"
                >
                  <Download className="w-4 h-4" />
                  Download Brosur
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-2 bg-gray-300 text-gray-500 px-6 py-2.5 rounded font-semibold text-sm cursor-not-allowed"
                  data-ocid="niaga.detail.cta.download_brosur_button"
                >
                  <Download className="w-4 h-4" />
                  Download Brosur
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Section 8 — Footnote */}
        {vehicle.footnote && (
          <section className="max-w-7xl mx-auto px-4 py-4">
            <p className="text-sm text-gray-400">{vehicle.footnote}</p>
          </section>
        )}

        {/* Section 9 — Specifications table */}
        {(vehicle.specifications ?? []).length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-6">
            <h2 className="text-xl font-bold text-[#333333] mb-4">
              Spesifikasi
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="border-collapse w-full text-sm">
                <thead>
                  <tr>
                    <th className="border border-gray-200 first:border-l-0 last:border-r-0 bg-black text-white px-4 py-3 text-left font-semibold">
                      Spesifikasi
                    </th>
                    <th className="border border-gray-200 first:border-l-0 last:border-r-0 bg-black text-white px-4 py-3 text-left font-semibold">
                      Nilai
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(vehicle.specifications ?? []).map((spec, idx) => (
                    <tr
                      key={`spec-${idx}-${spec.key}`}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      data-ocid={`niaga.detail.spec.item.${idx + 1}`}
                    >
                      <td className="border border-gray-200 first:border-l-0 last:border-r-0 px-4 py-2 text-gray-700 font-medium">
                        {spec.key}
                      </td>
                      <td className="border border-gray-200 first:border-l-0 last:border-r-0 px-4 py-2 text-gray-600">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 10 — Related products */}
        {related.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-10">
            <h2 className="text-xl font-bold text-[#333333] mb-1">
              Produk Mitsubishi Fuso Lainnya
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Memilih Mitsubishi FUSO adalah keputusan tepat yang akan
              menjadikan usaha berkembang pesat.
            </p>
            <div className="flex overflow-x-auto gap-4 pb-4">
              {related.map((v) => (
                <RelatedCard
                  key={v.id}
                  vehicle={v}
                  categorySlug={categorySlug}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
