import { Skeleton } from "@/components/ui/skeleton";
import { useGetPublishedVehicles } from "@/hooks/useVehicles";
import type { PassengerVehicle } from "@/types/local";
import { PhoneIcon } from "@heroicons/react/24/outline";
import { Link, useParams } from "@tanstack/react-router";
import { Calculator, Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "../../hooks/useActor";

const RED = "#CC0000";

const formatRupiah = (amount: bigint | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(amount));

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64 rounded-none" />
        <Skeleton className="h-10 w-36 rounded-none" />
      </div>
      <Skeleton className="h-4 w-full rounded-none" />
      <Skeleton className="h-4 w-3/4 rounded-none" />
      <div className="grid md:grid-cols-[20%_50%_30%] gap-6">
        <Skeleton className="h-64 rounded-none" />
        <Skeleton className="h-64 rounded-none" />
        <Skeleton className="h-64 rounded-none" />
      </div>
    </div>
  );
}

// ============================================================
// CTA Akhir Phone Icon (large, red — distinct from CTA button icons)
// ============================================================
function CtaPhoneDecorIcon() {
  return (
    <PhoneIcon
      className="w-10 h-10 flex-shrink-0 mx-auto md:mx-0"
      style={{ color: RED }}
      aria-hidden="true"
    />
  );
}

// ============================================================
// SECTION 3 — Interactive Product Section
// ============================================================
interface ProductSectionProps {
  vehicle: PassengerVehicle;
}

function ProductSection({ vehicle }: ProductSectionProps) {
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  const activeVariant = vehicle.variants[activeVariantIdx] ?? null;
  const activeColors = activeVariant?.colors ?? [];
  const activeColor = activeColors[activeColorIdx] ?? null;

  // CHANGE A.2 — main image uses vehicleImage, not colorImage
  const displayImage =
    activeColor?.vehicleImage ||
    activeVariant?.thumbnailUrl ||
    vehicle.heroImageUrl;

  const showPremiumToggle = activeVariant?.hasPremiumOption === true;

  const basePrice =
    activeColor && Number(activeColor.price) > 0
      ? activeColor.price
      : (activeVariant?.price ?? 0n);

  const displayPrice = isPremium ? basePrice + BigInt(30000000) : basePrice;

  // CHANGE A.3 — on variant change: reset color, set image to first color's vehicleImage
  const handleVariantChange = (idx: number) => {
    setActiveVariantIdx(idx);
    setActiveColorIdx(0);
    setIsPremium(false);
  };

  return (
    <>
      {/* ── DESKTOP layout ── */}
      <div className="hidden md:flex gap-6 items-start">
        {/* Left — Color swatches (20%) — CHANGE A.1, A.4, A.5 */}
        <div className="w-[20%] flex-shrink-0">
          {activeColors.length > 0 ? (
            <>
              {/* CHANGE A.5 — "Pilihan Warna" label, desktop only */}
              <p className="font-bold text-lg mb-2 hidden md:block">
                Pilihan Warna
              </p>
              <div className="grid grid-cols-3 gap-4">
                {activeColors.map((color, idx) => {
                  const isActive = idx === activeColorIdx;
                  return (
                    <button
                      key={`${color.colorName}-${idx}`}
                      type="button"
                      onClick={() => setActiveColorIdx(idx)}
                      // CHANGE A.4 — rounded-none, border-gray-200 when active
                      className={`w-16 h-16 overflow-hidden cursor-pointer rounded-none ${
                        isActive
                          ? "border-2 border-gray-200"
                          : "border border-gray-200"
                      }`}
                      title={color.colorName}
                      data-ocid="color-swatch"
                    >
                      {/* CHANGE A.1 — show colorImage in swatch */}
                      {color.colorImage ? (
                        <img
                          src={color.colorImage}
                          alt={color.colorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-base font-bold text-gray-700 mt-3 truncate">
                {activeColor?.colorName ?? ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Tidak ada pilihan warna</p>
          )}
        </div>

        {/* Center — Image + toggle + price (50%) */}
        <div className="w-[50%] flex-shrink-0 flex flex-col items-center">
          {/* CHANGE C — w-full main image desktop */}
          <div className="w-full bg-white border border-none flex justify-center">
            {displayImage ? (
              <img
                key={displayImage}
                src={displayImage}
                alt={activeColor?.colorName || vehicle.vehicleName}
                className="w-full aspect-video object-contain transition-opacity duration-300"
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-gray-50">
                <span className="text-gray-400 text-sm">Tidak ada gambar</span>
              </div>
            )}
          </div>

          {/* Premium toggle — CHANGE F: flex-1 h-10 for both buttons */}
          {showPremiumToggle && (
            <div className="flex items-center gap-0 mt-4 w-full max-w-xs">
              <button
                type="button"
                onClick={() => setIsPremium(false)}
                className="flex-1 h-10 text-sm font-semibold cursor-pointer border rounded-none transition-colors"
                style={
                  !isPremium
                    ? {
                        backgroundColor: "#000",
                        color: "#fff",
                        border: "1px solid #000",
                      }
                    : {
                        backgroundColor: "#fff",
                        color: "#000",
                        border: "1px solid #d1d5db",
                      }
                }
                data-ocid="toggle-ultimate"
              >
                Ultimate
              </button>
              <button
                type="button"
                onClick={() => setIsPremium(true)}
                className="flex-1 h-10 text-sm font-semibold cursor-pointer border rounded-none transition-colors"
                style={
                  isPremium
                    ? {
                        backgroundColor: "#000",
                        color: "#fff",
                        border: "1px solid #000",
                      }
                    : {
                        backgroundColor: "#fff",
                        color: "#000",
                        border: "1px solid #d1d5db",
                      }
                }
                data-ocid="toggle-ultimate-premium"
              >
                Ultimate Premium
              </button>
            </div>
          )}

          {/* CHANGE G — price text-center w-full text-center */}
          <p className="font-extrabold text-2xl text-black w-full text-center">
            {Number(displayPrice) > 0
              ? formatRupiah(displayPrice)
              : "Hubungi Sales"}
          </p>
        </div>

        {/* Right — Variant selector (30%) — CHANGE D + CHANGE E */}
        <div className="w-[30%] flex-shrink-0 flex flex-col gap-3">
          {/* CHANGE D — "Pilihan Varian" label */}
          <p className="font-bold text-lg mb-2">Pilihan Varian</p>
          {vehicle.variants.map((variant, idx) => {
            const isActive = idx === activeVariantIdx;
            return (
              <button
                key={variant.variantName}
                type="button"
                onClick={() => handleVariantChange(idx)}
                // CHANGE E — horizontal layout: flex items-center gap-2
                className="flex items-center gap-2 cursor-pointer group w-full text-left"
                data-ocid="variant-selector"
              >
                {/* CHANGE E — thumbnail left, slightly larger */}
                <div
                  className="w-16 h-10 overflow-hidden rounded-none flex-shrink-0 border-0"
                  style={{
                    backgroundColor: "#f9fafb",
                  }}
                >
                  {variant.thumbnailUrl || vehicle.heroImageUrl ? (
                    <img
                      src={variant.thumbnailUrl || vehicle.heroImageUrl}
                      alt={variant.variantName}
                      className={`w-full h-full object-contain ${isActive ? "opacity-100" : "opacity-50"}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                {/* CHANGE E — variant name on right, text-lg */}
                <span
                  className={`text-base font-bold relative ${
                    isActive ? "font-semibold text-black" : "text-gray-500"
                  }`}
                >
                  {variant.variantName}
                  {isActive && (
                    <span
                      className="absolute bottom-[-4px] left-0 w-full h-0.5 transition-all duration-300"
                      style={{ backgroundColor: RED }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MOBILE layout ── */}
      <div className="md:hidden flex flex-col gap-4">
        {/* CHANGE C — main image w-full mobile */}
        <div className="w-full bg-white border border-gray-100 flex justify-center">
          {displayImage ? (
            <img
              key={displayImage}
              src={displayImage}
              alt={activeColor?.colorName || vehicle.vehicleName}
              className="w-full aspect-video object-contain transition-opacity duration-300"
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center bg-gray-50">
              <span className="text-gray-400 text-sm">Tidak ada gambar</span>
            </div>
          )}
        </div>

        {/* CHANGE H — active variant name: text-center w-full */}
        {activeVariant && (
          <p className="font-bold text-lg text-center w-full md:text-left">
            {activeVariant.variantName}
          </p>
        )}

        {/* Color swatches — mobile: 7 per row */}
        {activeColors.length > 0 && (
          <div className="grid grid-cols-7 gap-1.5 justify-items-center">
            {activeColors.map((color, idx) => {
              const isActive = idx === activeColorIdx;
              return (
                <button
                  key={`${color.colorName}-${idx}`}
                  type="button"
                  onClick={() => setActiveColorIdx(idx)}
                  className={`w-10 h-10 overflow-hidden cursor-pointer rounded-none ${
                    isActive
                      ? "border-2 border-gray-200"
                      : "border border-gray-200"
                  }`}
                  title={color.colorName}
                  data-ocid="color-swatch-mobile"
                >
                  {/* CHANGE A.1 — colorImage in swatch */}
                  {color.colorImage ? (
                    <img
                      src={color.colorImage}
                      alt={color.colorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Premium toggle mobile — CHANGE F: flex-1 h-10, CHANGE H: justify-center */}
        {showPremiumToggle && (
          <div className="flex items-center gap-0 justify-center md:justify-start">
            <button
              type="button"
              onClick={() => setIsPremium(false)}
              className="flex-1 h-10 text-sm font-semibold cursor-pointer border rounded-none"
              style={
                !isPremium
                  ? {
                      backgroundColor: "#000",
                      color: "#fff",
                      border: "1px solid #000",
                    }
                  : {
                      backgroundColor: "#fff",
                      color: "#000",
                      border: "1px solid #d1d5db",
                    }
              }
              data-ocid="toggle-ultimate-mobile"
            >
              Ultimate
            </button>
            <button
              type="button"
              onClick={() => setIsPremium(true)}
              className="flex-1 h-10 text-sm font-semibold cursor-pointer border rounded-none"
              style={
                isPremium
                  ? {
                      backgroundColor: "#000",
                      color: "#fff",
                      border: "1px solid #000",
                    }
                  : {
                      backgroundColor: "#fff",
                      color: "#000",
                      border: "1px solid #d1d5db",
                    }
              }
              data-ocid="toggle-ultimate-premium-mobile"
            >
              Ultimate Premium
            </button>
          </div>
        )}

        {/* Price mobile — CHANGE G: text-center w-full */}
        <p className="font-bold text-2xl text-black w-full text-center">
          {Number(displayPrice) > 0
            ? formatRupiah(displayPrice)
            : "Hubungi Sales"}
        </p>

        {/* Pilihan Varian label on mobile */}
        <p className="font-bold text-lg mb-1 text-left w-full">
          Pilihan Varian
        </p>

        {/* Variant list — CHANGE 3: flex-col items-start w-full */}
        <div className="flex flex-col items-start w-full gap-2 pb-2">
          {vehicle.variants.map((variant, idx) => {
            const isActive = idx === activeVariantIdx;
            return (
              <button
                key={variant.variantName}
                type="button"
                onClick={() => handleVariantChange(idx)}
                // CHANGE 3 — flex items-center gap-2 justify-start (horizontal)
                className="w-full flex items-center gap-2 cursor-pointer justify-start"
                data-ocid="variant-selector-mobile"
              >
                <div
                  className="w-14 h-10 overflow-hidden rounded-none flex-shrink-0 border-0"
                  style={{
                    backgroundColor: "#f9fafb",
                  }}
                >
                  {variant.thumbnailUrl || vehicle.heroImageUrl ? (
                    <img
                      src={variant.thumbnailUrl || vehicle.heroImageUrl}
                      alt={variant.variantName}
                      className={`w-full h-full object-contain ${isActive ? "opacity-100" : "opacity-50"}`}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <span
                  className={`text-base font-bold relative ${
                    isActive ? "font-semibold text-black" : "text-gray-500"
                  }`}
                >
                  {variant.variantName}
                  {isActive && (
                    <span
                      className="absolute bottom-[-3px] left-0 w-full h-0.5"
                      style={{ backgroundColor: RED }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* CHANGE I — Footnotes mobile: text-xs md:text-sm */}
        {vehicle.footnotes && vehicle.footnotes.length > 0 && (
          <div className="mt-2 space-y-1">
            {vehicle.footnotes.map((fn) => (
              <p key={fn} className="text-xs md:text-sm text-gray-500">
                *{fn}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Footnotes desktop — CHANGE I */}
      {vehicle.footnotes && vehicle.footnotes.length > 0 && (
        <div className="hidden md:block mt-4 space-y-1">
          {vehicle.footnotes.map((fn) => (
            <p key={fn} className="text-xs md:text-sm text-gray-500">
              *{fn}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

// ============================================================
// SECTION 6 — Spec Tabs with dynamic columns and colSpan cells
// ============================================================
interface TabsSectionProps {
  vehicle: PassengerVehicle;
}

function TabsSection({ vehicle }: TabsSectionProps) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  const tabs = vehicle.specTabs ?? [];
  const activeTab = tabs[activeTabIdx] ?? null;

  const columns = activeTab?.columns ?? [];
  const rows = activeTab?.rows ?? [];
  const hasData = columns.length > 0 && rows.length > 0;

  // Column widths: col 0 = 34%, rest = 66/(n-1)% each
  const colWidths: string[] = columns.map((_, i) => {
    if (i === 0) return "34%";
    return columns.length > 1
      ? `${(66 / (columns.length - 1)).toFixed(0)}%`
      : "66%";
  });

  return (
    <div>
      {/* "SPECIFICATION" label */}
      <h2 className="font-bold tracking-widest text-sm uppercase mb-3">
        SPECIFICATION
      </h2>

      {tabs.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">
          Spesifikasi belum tersedia.
        </p>
      ) : (
        <>
          {/* Tab nav: per spec — flex overflow-x-auto border-b mb-0 */}
          <div className="flex overflow-x-auto border-b border-gray-200 mb-0">
            {tabs.map((tab, idx) => {
              const isActive = idx === activeTabIdx;
              return (
                <button
                  key={tab.title}
                  type="button"
                  onClick={() => setActiveTabIdx(idx)}
                  className={`px-5 py-2 text-sm whitespace-nowrap cursor-pointer transition-colors rounded-none ${
                    isActive
                      ? "border-b-2 border-[#CC0000] text-[#CC0000] font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={isActive ? { marginBottom: "-1px" } : {}}
                  data-ocid={`tab-${tab.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>

          {/* Tab content — dynamic columns + colSpan cells */}
          <div className="pt-2">
            {!hasData ? (
              <div className="text-sm text-gray-400 py-8 text-center w-full">
                Data spesifikasi belum tersedia.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto w-full">
                  <table className="border-collapse w-full min-w-max text-sm table-fixed">
                    {/* colgroup for column widths */}
                    {columns.length === 1 ? (
                      <colgroup>
                        <col style={{ width: "100%" }} />
                      </colgroup>
                    ) : (
                      <colgroup>
                        <col style={{ width: colWidths[0] }} />
                        {columns.slice(1).map((_, i) => (
                          <col
                            // biome-ignore lint/suspicious/noArrayIndexKey: static column index
                            key={i}
                            style={{ width: colWidths[i + 1] }}
                          />
                        ))}
                      </colgroup>
                    )}
                    <thead>
                      <tr className="bg-black text-white">
                        {columns.map((col, i) => (
                          <th
                            // biome-ignore lint/suspicious/noArrayIndexKey: static column index
                            key={`th-${i}`}
                            className={`px-4 py-3 text-sm font-semibold border-b border-gray-700${i > 0 ? " border-l border-gray-700" : ""}${i === 0 ? " text-left" : " text-center"}`}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIndex) => {
                        const rowBg =
                          rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50";
                        return (
                          <tr
                            // biome-ignore lint/suspicious/noArrayIndexKey: rows have no stable id
                            key={`row-${rowIndex}`}
                            className={`${rowBg} border-b border-gray-200`}
                          >
                            {row.cells.map((cell, ci) => {
                              const cellColSpan = Number(cell.colSpan ?? 1);
                              const isLastCell = ci === row.cells.length - 1;
                              const borderRightClass = isLastCell
                                ? " border-r-0"
                                : "";
                              return (
                                <td
                                  // biome-ignore lint/suspicious/noArrayIndexKey: cells have no stable id
                                  key={`cell-${rowIndex}-${ci}`}
                                  colSpan={cellColSpan}
                                  className={`px-4 py-3 text-gray-700${ci > 0 ? " border-l border-gray-200" : ""}${ci === 0 ? " text-left" : " text-center"}${borderRightClass}`}
                                >
                                  {cell.value}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">
                  *Untuk spesifikasi lengkap hubungi sales atau download Brosur.
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MobilKeluargaDetailPage() {
  const { slug } = useParams({ from: "/mobil-keluarga/$slug" });
  const { data: vehicles, isLoading, isPending } = useGetPublishedVehicles();
  const [isDownloading, setIsDownloading] = useState(false);
  const { actor } = useActor();
  const [heroBannerVideoUrl, setHeroBannerVideoUrl] = useState<string | null>(
    null,
  );

  const vehicle = vehicles
    ? (vehicles.find((v) => v.slug === slug) ??
      vehicles.find((v) => v.id.toString() === slug) ??
      null)
    : null;

  useEffect(() => {
    let cancelled = false;
    if (!vehicle?.heroBannerVideoId || !actor) {
      setHeroBannerVideoUrl(null);
      return;
    }
    (async () => {
      try {
        const asset = await (actor as any).getPublicMediaAssetById(
          vehicle.heroBannerVideoId,
        );
        if (!cancelled) {
          setHeroBannerVideoUrl(asset?.storageUrl ?? null);
        }
      } catch {
        if (!cancelled) setHeroBannerVideoUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vehicle?.heroBannerVideoId, actor]);

  // Show skeleton while loading OR while actor hasn't initialized yet
  if (isLoading || isPending || vehicles === undefined)
    return <DetailSkeleton />;

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Kendaraan tidak ditemukan
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Kendaraan yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link
            to="/mobil-keluarga"
            className="inline-flex items-center px-5 py-2.5 text-white text-sm font-semibold rounded-none transition-opacity hover:opacity-90"
            style={{ backgroundColor: RED }}
            data-ocid="back-to-catalog"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  // CHANGE 4 — brochure download handler with fetch+blob for .pdf extension
  const handleDownloadBrosur = async () => {
    const url = vehicle?.brochureUrl;
    if (!url) {
      alert("Brosur belum tersedia.");
      return;
    }
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const vehicleName = vehicle.vehicleName || "Kendaraan";
      const downloadName = `Brosur_${vehicleName.replace(/\s+/g, "_")}.pdf`;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch {
      alert("Gagal mengunduh brosur.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* ── HERO SECTION ── */}
      {heroBannerVideoUrl ? (
        <section className="relative w-full h-[200px] md:h-[450px] overflow-hidden bg-black">
          <video
            src={heroBannerVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </section>
      ) : (
        <section className="w-full h-[200px] md:h-[450px] bg-black flex items-center justify-center">
          <img
            src="https://blob.caffeine.ai/v1/blob/?blob_hash=sha256%3A9b108edac4f6aa33fbf410b4f1ee06a5da7b510e76f481157f635b628b31992c&owner_id=bskla-eiaaa-aaaan-q4qba-cai&project_id=019c76c5-c8d9-757e-ad55-3b3449510206"
            alt="Logo"
            className="h-40 w-auto object-contain"
          />
        </section>
      )}

      {/* ── SECTION 1 — Header Produk ── */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          {vehicle.titleImageUrl ? (
            <div className="h-12 w-auto max-w-48 md:max-w-56">
              <img
                src={vehicle.titleImageUrl}
                alt={vehicle.vehicleName}
                className="w-full h-full object-contain object-left"
              />
            </div>
          ) : (
            <h1 className="font-bold text-3xl md:text-4xl text-black leading-tight">
              {vehicle.vehicleName}
            </h1>
          )}
          <button
            type="button"
            onClick={async () => {
              const shareTitle = vehicle.vehicleName;
              const shareUrl = window.location.href;
              if (navigator.share) {
                try {
                  await navigator.share({ title: shareTitle, url: shareUrl });
                } catch {
                  // user cancelled or error — do nothing
                }
              } else {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  alert("Link disalin!");
                } catch {
                  alert("Link disalin!");
                }
              }
            }}
            className="flex items-center gap-2 bg-[#CC0000] text-white px-5 md:px-8 py-3 rounded-none text-sm font-semibold hover:bg-[#B30000] transition-colors flex-shrink-0"
            data-ocid="btn-share"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden md:inline">Bagikan</span>
          </button>
        </div>
      </section>

      {/* ── SECTION 2 — Deskripsi Produk ── */}
      {vehicle.description && (
        <section className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-gray-700 leading-relaxed text-base">
            {vehicle.description}
          </p>
        </section>
      )}

      {/* ── SECTION 3 — Gambar Interaktif & Varian ── */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <ProductSection vehicle={vehicle} />
      </section>

      {/* ── SECTION 4 — CTA Buttons — CHANGE J + CHANGE K ── */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-2">
          {/* Button 1 — WhatsApp — CHANGE J */}
          <a
            href={`https://wa.me/6285212340778?text=Hai..%20Saya%20tertarik%20dengan%20produk%20mobil%20Mitsubishi%20%22${encodeURIComponent(vehicle.vehicleName)}%22`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold uppercase text-white rounded-none hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#398E3D" }}
            data-ocid="btn-whatsapp"
          >
            <PhoneIcon className="w-5 h-5" />
            <span>WHATSAPP</span>
          </a>

          {/* Button 2 — Simulasi Kredit — CHANGE J */}
          <Link
            to="/simulasi-kredit"
            className="col-span-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold uppercase text-white rounded-none hover:opacity-90 transition-opacity"
            style={{ backgroundColor: RED }}
            data-ocid="btn-simulasi-kredit"
          >
            <Calculator className="w-5 h-5" />
            <span className="hidden md:inline">SIMULASI KREDIT</span>
            <span className="inline md:hidden">SIMULASI</span>
          </Link>

          {/* Button 3 — Download Brosur — CHANGE J + CHANGE 4 */}
          <button
            type="button"
            onClick={handleDownloadBrosur}
            disabled={isDownloading}
            className="col-span-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold uppercase text-white rounded-none hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#003355",
              opacity: isDownloading ? 0.5 : vehicle.brochureUrl ? 1 : 0.6,
              cursor:
                isDownloading || !vehicle.brochureUrl
                  ? "not-allowed"
                  : "pointer",
            }}
            data-ocid="btn-download-brosur"
          >
            <Download className="w-5 h-5" />
            <span className="hidden md:inline">DOWNLOAD BROSUR</span>
            <span className="inline md:hidden">BROSUR</span>
          </button>
        </div>
      </section>

      {/* ── SECTION 5 — Purna Jual ── */}
      {vehicle.aftersaleImages && vehicle.aftersaleImages.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-bold text-2xl text-black mb-2">Purna Jual</h2>
              <p className="text-lg font-medium text-gray-700 mb-3">
                Keunggulan Layanan Kami
              </p>
              <p className="text-gray-600 leading-relaxed">
                Mitsubishi Motors berkomitmen memberikan pelayanan purna jual
                terbaik untuk Anda.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {vehicle.aftersaleImages.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="Purna jual"
                  className="w-full h-full object-contain"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 6 — Tab Konten (CHANGE L) ── */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <TabsSection vehicle={vehicle} />
      </section>

      {/* ── SECTION 7 — CTA Akhir — CHANGE M ── */}
      <section
        className="w-full py-12 px-4"
        style={{ backgroundColor: "#E0E0E0" }}
      >
        {/* CHANGE M — flex-col items-center text-center on mobile; row on desktop */}
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center md:flex-row md:text-left md:items-start gap-6">
          {/* CHANGE M — icon centered on mobile */}
          <CtaPhoneDecorIcon />

          <div className="flex flex-col gap-2 flex-1">
            {/* CHANGE M — title */}
            <p className="font-bold text-2xl text-black text-center md:text-left w-full">
              {vehicle.ctaText || "Siap Memiliki Kendaraan Impian Anda?"}
            </p>
            {/* CHANGE M — subtitle */}
            <p className="text-base text-gray-600 text-center md:text-left">
              {vehicle.ctaSubtext ||
                "Hubungi tim sales kami sekarang untuk penawaran terbaik."}
            </p>
          </div>

          {/* CHANGE M — button centered on mobile */}
          <div className="flex justify-center md:justify-start">
            <a
              href={vehicle.ctaButtonUrl || "/kontak"}
              className="flex-shrink-0 text-white capitalize font-semibold px-8 py-3 rounded-none hover:bg-red-800 transition-colors text-sm"
              style={{ backgroundColor: RED }}
              data-ocid="btn-cta-akhir"
            >
              {vehicle.ctaButtonLabel === "HUBUNGI KAMI"
                ? "Hubungi Kami"
                : vehicle.ctaButtonLabel || "Hubungi Kami"}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
