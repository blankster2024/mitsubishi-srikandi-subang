import { ImageIcon, Star } from "lucide-react";
import { useEffect } from "react";
import { useGetPublishedTestimonials } from "../../hooks/useTestimonials";
import { useGetWebsiteSettings } from "../../hooks/useWebsiteSettings";
import type { Testimonial } from "../../types/local";

function renderStars(rating: number) {
  return [1, 2, 3, 4, 5].map((star) => (
    <span key={star} className="text-yellow-400 text-sm">
      {star <= rating ? "★" : "☆"}
    </span>
  ));
}

function SkeletonCard() {
  return (
    <div className="rounded-none overflow-hidden border border-gray-100 h-full flex flex-col animate-pulse">
      {/* Image area */}
      <div className="aspect-video bg-gray-200 w-full" />
      {/* Content area */}
      <div className="p-5 flex flex-col gap-3">
        {/* Name + city row */}
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-2/5" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
        {/* Vehicle */}
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        {/* Rating */}
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        {/* Text lines */}
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const hasPhoto = t.customerPhotoId && t.customerPhotoId.trim() !== "";
  const hasVehicle = t.vehicleName && t.vehicleName.trim() !== "";

  return (
    <div
      className="rounded-none overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 h-full flex flex-col"
      data-ocid="testimonial.card"
    >
      {/* Cover image section */}
      <div className="overflow-hidden">
        {hasPhoto ? (
          <img
            src={t.customerPhotoId}
            alt={t.customerName}
            className="aspect-video object-cover w-full hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="aspect-video bg-gray-200 w-full flex items-center justify-center">
            <ImageIcon className="text-gray-400" size={40} />
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-5 flex flex-col flex-1">
        {/* Name and City row */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-base font-bold text-gray-900 leading-snug">
            {t.customerName}
          </span>
          <span className="text-sm text-gray-400">{t.customerCity}</span>
        </div>

        {/* Vehicle purchased */}
        {hasVehicle && (
          <p className="text-sm text-gray-600 mt-1">{t.vehicleName}</p>
        )}

        {/* Star rating */}
        <div className="flex items-center gap-0.5 mt-1">
          {renderStars(t.rating)}
        </div>

        {/* Testimonial text */}
        <p className="text-sm text-gray-500 mt-2 line-clamp-5 leading-relaxed">
          {t.message}
        </p>
      </div>
    </div>
  );
}

export default function TestimoniPage() {
  const { data: testimonials, isLoading } = useGetPublishedTestimonials();
  const { data: settings } = useGetWebsiteSettings();

  const siteName = settings?.siteName || "Mitsubishi Srikandi Subang";

  useEffect(() => {
    document.title = `Testimoni — ${siteName}`;
  }, [siteName]);

  return (
    <main data-ocid="testimoni.page">
      {/* Hero Section */}
      <section
        aria-label="Hero Testimoni"
        className="h-[150px] md:h-[250px] bg-[#CC0000] flex items-center justify-center"
      >
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
            <Star
              className="w-6 h-6 md:w-8 md:h-8 text-white"
              aria-hidden="true"
            />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
              Testimoni
            </h1>
          </div>
          <p className="text-sm md:text-lg max-w-2xl mx-auto opacity-90 text-white">
            Kepuasan pelanggan adalah prioritas utama kami.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Apa Kata Pelanggan Kami
        </h2>

        {/* Loading skeletons */}
        {isLoading && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="testimoni.loading_state"
          >
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
              <SkeletonCard key={k} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!testimonials || testimonials.length === 0) && (
          <div
            className="text-center text-gray-500 py-20"
            data-ocid="testimoni.empty_state"
          >
            Belum ada testimoni.
          </div>
        )}

        {/* Grid */}
        {!isLoading && testimonials && testimonials.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="testimoni.list"
          >
            {testimonials.map((t, idx) => (
              <div key={String(t.id)} data-ocid={`testimoni.item.${idx + 1}`}>
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
