import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Share2,
  Tag,
  XCircle,
} from "lucide-react";
import { useEffect } from "react";
import { useGetPublishedPromos } from "../../hooks/usePromotions";
import { useGetPublishedVehicles } from "../../hooks/useVehicles";
import { useGetWebsiteSettings } from "../../hooks/useWebsiteSettings";

const formatDate = (ns: bigint) => {
  const date = new Date(Number(ns) / 1_000_000);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateShort = (ns: bigint) => {
  const date = new Date(Number(ns) / 1_000_000);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isPromoActive = (startDate: bigint, endDate: bigint) => {
  const now = Date.now();
  const start = Number(startDate) / 1_000_000;
  const end = Number(endDate) / 1_000_000;
  return now >= start && now <= end;
};

function DetailSkeleton() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="w-full h-72 bg-gray-200 rounded-xl" />
        <div className="space-y-3 pt-2">
          <div className="h-8 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
        </div>
        <div className="h-14 w-full bg-gray-200 rounded-lg" />
      </div>
    </main>
  );
}

export default function PromoDetailPage() {
  const { slug } = useParams({ from: "/promo/$slug" });
  const { data: promos, isLoading, isPending } = useGetPublishedPromos();
  const { data: settings } = useGetWebsiteSettings();
  const { data: passengerVehicles } = useGetPublishedVehicles();

  const siteName = settings?.siteName || "Mitsubishi Srikandi Subang";
  const promo = promos?.find((p) => p.slug === slug) ?? null;

  useEffect(() => {
    if (promo) {
      document.title = `${promo.title} — ${siteName}`;
    } else {
      document.title = `Promo — ${siteName}`;
    }
  }, [promo, siteName]);

  if (isLoading || isPending || promos === undefined) return <DetailSkeleton />;

  if (promo === null) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">Promo tidak ditemukan.</p>
        <Link
          to="/promo"
          className="inline-flex items-center gap-2 text-[#CC0000] hover:underline text-sm font-medium"
          data-ocid="promo.back_link"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Promo
        </Link>
      </main>
    );
  }

  // Unwrap Candid optional fields
  const vehicleRef = Array.isArray(promo.vehicleRef)
    ? (promo.vehicleRef[0] ?? "")
    : "";
  const vehicleRefType = Array.isArray(promo.vehicleRefType)
    ? (promo.vehicleRefType[0] ?? "")
    : "";
  const relatedPassenger =
    vehicleRef && vehicleRefType === "passenger"
      ? passengerVehicles?.find((v) => v.slug === vehicleRef)
      : null;

  const active = isPromoActive(promo.startDate, promo.endDate);
  const imageUrl =
    Array.isArray(promo.imageId) && promo.imageId.length > 0
      ? promo.imageId[0]
      : typeof promo.imageId === "string" && promo.imageId
        ? promo.imageId
        : null;

  // Build WhatsApp message
  const waMessage = encodeURIComponent(
    `Halo Mitsubishi Srikandi Subang,\nSaya tertarik dengan promo berikut:\n\nJudul Promo: ${promo.title}\nBerlaku: ${formatDate(promo.startDate)} – ${formatDate(promo.endDate)}\n\nMohon informasi lebih lanjut. Terima kasih.`,
  );
  const waUrl = `https://wa.me/6285212340778?text=${waMessage}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({ title: promo.title, url: window.location.href })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Back link row */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/promo"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#CC0000] transition-colors group"
          data-ocid="promo.back_link"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Promo
        </Link>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          data-ocid="promo.share_button"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden md:inline">Bagikan</span>
        </button>
      </div>

      {/* Banner Image */}
      <div className="w-full overflow-hidden rounded-xl bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={promo.title}
            className="w-full max-h-80 object-cover"
          />
        ) : null}
      </div>

      {/* Title & Meta */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              active
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-500 border border-gray-200"
            }`}
          >
            {active ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <XCircle className="w-3.5 h-3.5" />
            )}
            {active ? "Promo Aktif" : "Promo Berakhir"}
          </span>

          {/* Date range badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-gray-500 bg-gray-50 border border-gray-200">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateShort(promo.startDate)} –{" "}
            {formatDateShort(promo.endDate)}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
          {promo.title}
        </h1>

        {/* Tags */}
        {promo.tags && promo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {promo.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs bg-[#CC0000]/8 text-[#CC0000] border border-[#CC0000]/20 px-2.5 py-1 rounded-full font-medium"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-6" />

      {/* Description */}
      {promo.description && (
        <div
          className="prose prose-sm max-w-none text-gray-700 text-base leading-relaxed"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: rich text from admin
          dangerouslySetInnerHTML={{ __html: promo.description ?? "" }}
        />
      )}

      {/* Terms & Conditions */}
      {promo.termsAndConditions && promo.termsAndConditions.trim() !== "" && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Syarat &amp; Ketentuan
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {promo.termsAndConditions}
          </p>
        </div>
      )}

      {/* Promo Period Detail */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Mulai</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(promo.startDate)}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Berakhir</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatDate(promo.endDate)}
          </p>
        </div>
      </div>

      {/* Related Passenger Vehicle */}
      {vehicleRef && relatedPassenger && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Kendaraan Terkait
          </h2>
          <Link
            to="/mobil-keluarga/$slug"
            params={{ slug: relatedPassenger.slug }}
            className="group flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#CC0000]/40 hover:shadow-sm transition-all"
            data-ocid="promo.vehicle_detail_link"
          >
            {relatedPassenger.heroImageUrl && (
              <div className="w-20 h-16 overflow-hidden rounded-lg flex-shrink-0 bg-gray-100">
                <img
                  src={relatedPassenger.heroImageUrl}
                  alt={relatedPassenger.vehicleName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate group-hover:text-[#CC0000] transition-colors">
                {relatedPassenger.vehicleName}
              </p>
              <p className="text-xs text-[#CC0000] mt-1 font-medium">
                Lihat Detail →
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Related Commercial Vehicle (stub) */}
      {vehicleRef && vehicleRefType === "commercial" && !relatedPassenger && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Kendaraan Terkait
          </h2>
          <Link
            to="/mobil-niaga/$kategori/$slug"
            params={{ kategori: "light-duty", slug: vehicleRef }}
            className="group flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#CC0000]/40 hover:shadow-sm transition-all"
            data-ocid="promo.vehicle_detail_link"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate capitalize group-hover:text-[#CC0000] transition-colors">
                {vehicleRef.replace(/-/g, " ")}
              </p>
              <p className="text-xs text-[#CC0000] mt-1 font-medium">
                Lihat Detail →
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* CTA — WhatsApp */}
      <div className="mt-8 bg-gradient-to-br from-[#CC0000] to-[#a80000] rounded-2xl p-6 md:p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">
          Tertarik dengan promo ini?
        </p>
        <h2 className="text-xl md:text-2xl font-bold mb-1">
          Hubungi Sales Kami Sekarang
        </h2>
        <p className="text-sm text-white/80 mb-5">
          Konsultasikan kebutuhan kendaraan Anda langsung bersama tim kami.
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-white text-[#CC0000] font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm shadow-sm"
          data-ocid="promo.whatsapp_cta_button"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Chat via WhatsApp
        </a>
      </div>
    </main>
  );
}
