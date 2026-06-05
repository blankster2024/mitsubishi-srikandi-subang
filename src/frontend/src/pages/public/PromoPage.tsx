import { Link } from "@tanstack/react-router";
import { ChevronRight, Tag } from "lucide-react";
import { useEffect } from "react";
import { useGetPublishedPromos } from "../../hooks/usePromotions";
import { useGetWebsiteSettings } from "../../hooks/useWebsiteSettings";

const formatDate = (ns: bigint) => {
  const date = new Date(Number(ns) / 1_000_000);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ── Skeleton Card ──────────────────────────────────────────────────────────────
function PromoCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100">
      <div className="aspect-video bg-gray-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mt-2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3 mt-1" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-full mt-2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-4/6" />
        <div className="border-t border-gray-100 mt-4 pt-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PromoPage() {
  const { data: promos, isLoading } = useGetPublishedPromos();
  const { data: settings } = useGetWebsiteSettings();

  const siteName = settings?.siteName || "Mitsubishi Srikandi Subang";

  useEffect(() => {
    document.title = `Promo — ${siteName}`;
  }, [siteName]);

  return (
    <main>
      <section
        aria-label="Hero Promo Mitsubishi"
        className="h-[150px] md:h-[250px] bg-[#CC0000] flex items-center justify-center"
      >
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
            <Tag
              className="w-6 h-6 md:w-8 md:h-8 text-white"
              aria-hidden="true"
            />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
              Promo
            </h1>
          </div>
          <p className="text-sm md:text-lg max-w-2xl mx-auto opacity-90 text-white">
            Dapatkan penawaran menarik, diskon dan paket spesial untuk semua
            tipe Mitsubishi.
          </p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Page Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Promo Terbaik Kami
        </h1>

        {/* Loading State — 6 skeleton cards */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(["s1", "s2", "s3", "s4", "s5", "s6"] as const).map((k) => (
              <PromoCardSkeleton key={k} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!promos || promos.length === 0) && (
          <div
            className="text-center py-20 text-gray-500"
            data-ocid="promo.empty_state"
          >
            Belum ada promo aktif saat ini.
          </div>
        )}

        {/* Promo Grid */}
        {!isLoading && promos && promos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo, index) => {
              const imageUrl =
                Array.isArray(promo.imageId) && promo.imageId.length > 0
                  ? promo.imageId[0]
                  : typeof promo.imageId === "string" && promo.imageId
                    ? promo.imageId
                    : null;

              const _firstTag =
                Array.isArray(promo.tags) && promo.tags.length > 0
                  ? promo.tags[0]
                  : null;

              return (
                <Link
                  key={promo.id.toString()}
                  to="/promo/$slug"
                  params={{ slug: promo.slug }}
                  className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 group block"
                  data-ocid={`promo.item.${index + 1}`}
                >
                  {/* Image */}
                  <div className="overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={promo.title}
                        className="aspect-video object-cover w-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-300 text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 mt-2 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                      {promo.title}
                    </h3>

                    {/* Validity dates */}
                    <p className="text-xs text-gray-400 mt-1">
                      Berlaku: {formatDate(promo.startDate)} –{" "}
                      {formatDate(promo.endDate)}
                    </p>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                      {promo.description}
                    </p>

                    {/* Divider + Bottom row */}
                    <div className="border-t border-gray-100 mt-4 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600 flex items-center gap-1">
                          Lihat Detail Promo{" "}
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
