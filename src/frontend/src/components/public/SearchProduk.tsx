import { useGetPublishedBlogPosts } from "@/hooks/useBlogPosts";
import { useGetPublishedCommercialVehicles } from "@/hooks/useCommercialVehicles";
import { useGetPublishedPromos } from "@/hooks/usePromotions";
import { useSearchIndex } from "@/hooks/useSearchIndex";
import type { SearchIndexEntry } from "@/hooks/useSearchIndex";
import { useGetPublishedVehicles } from "@/hooks/useVehicles";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const TYPE_LABEL: Record<SearchIndexEntry["entryType"], string> = {
  vehicle: "Kendaraan",
  promo: "Promo",
  article: "Artikel",
};

const TYPE_COLOR: Record<SearchIndexEntry["entryType"], string> = {
  vehicle: "bg-red-100 text-red-700",
  promo: "bg-amber-100 text-amber-700",
  article: "bg-blue-100 text-blue-700",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface SearchProdukProps {
  embedded?: boolean;
}

export default function SearchProduk({ embedded = false }: SearchProdukProps) {
  const navigate = useNavigate();

  // Fetch real data for search index
  const { data: passengerVehicles = [] } = useGetPublishedVehicles();
  const { data: commercialVehicles = [] } = useGetPublishedCommercialVehicles();
  const { data: promos = [] } = useGetPublishedPromos();
  const { data: articles = [] } = useGetPublishedBlogPosts();

  const { getAutosuggestions } = useSearchIndex(
    passengerVehicles,
    commercialVehicles,
    promos,
    articles,
  );

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions =
    debouncedQuery.length >= 2 ? getAutosuggestions(debouncedQuery) : [];

  const grouped = {
    vehicle: suggestions.filter((s) => s.entryType === "vehicle"),
    promo: suggestions.filter((s) => s.entryType === "promo"),
    article: suggestions.filter((s) => s.entryType === "article"),
  };

  const hasResults = suggestions.length > 0;

  useEffect(() => {
    if (debouncedQuery.length >= 2 && hasResults) {
      setOpen(true);
    } else if (debouncedQuery.length < 2) {
      setOpen(false);
    }
  }, [debouncedQuery, hasResults]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(() => {
    const q = query.trim();
    if (q) {
      setOpen(false);
      navigate({ to: "/search", search: { q } });
    }
  }, [query, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setOpen(false);
  };

  const handleSuggestionClick = (entry: SearchIndexEntry) => {
    setOpen(false);
    setQuery(entry.title);
    window.location.href = entry.url;
  };

  const handleShowAll = () => {
    const q = query.trim();
    if (q) {
      setOpen(false);
      navigate({ to: "/search", search: { q } });
    }
  };

  const clearQuery = () => {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const content = (
    <div className="relative z-10">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={embedded ? "mb-5" : "text-center mb-10"}
      >
        <p className="text-xs font-semibold tracking-widest text-[#C90010] uppercase mb-2">
          Stay Connected
        </p>
        <h2
          className={`font-bold text-gray-900 mb-2 leading-tight ${embedded ? "text-lg md:text-xl" : "text-3xl md:text-4xl"}`}
        >
          Temukan Kendaraan Impian Anda
        </h2>
        <p
          className={`text-gray-500 ${embedded ? "text-sm" : "text-base md:text-lg"}`}
        >
          Cari kendaraan, promo menarik, atau artikel informatif
        </p>
      </motion.div>

      {/* Search bar container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="w-full"
        ref={containerRef}
      >
        <div className="relative">
          <div className="flex items-center bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-visible focus-within:ring-2 focus-within:ring-[#C90010]/30 transition-shadow duration-200">
            <div className="pl-4 pr-2 flex-shrink-0 text-gray-400">
              <Search size={18} />
            </div>
            <input
              ref={inputRef}
              data-ocid="search.search_input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (debouncedQuery.length >= 2 && hasResults) setOpen(true);
              }}
              placeholder="Cari mobil, promo atau artikel..."
              className={`flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm focus:outline-none pr-2 ${embedded ? "h-11" : "h-14 text-base"}`}
              aria-label="Cari produk"
              aria-autocomplete="list"
              aria-expanded={open}
            />
            {query && (
              <button
                onClick={clearQuery}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Hapus pencarian"
                type="button"
              >
                <X size={14} />
              </button>
            )}
            <button
              data-ocid="search.primary_button"
              onClick={handleSearch}
              type="button"
              className="m-1.5 px-4 h-8 bg-[#C90010] hover:bg-[#A80010] text-white font-semibold rounded-xl text-xs transition-colors duration-200 flex items-center gap-1.5 flex-shrink-0 shadow-md"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Cari</span>
            </button>
          </div>

          {/* Autosuggestion dropdown */}
          <AnimatePresence>
            {open && hasResults && (
              <motion.div
                data-ocid="search.dropdown_menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
              >
                {(["vehicle", "promo", "article"] as const).map((type) => {
                  const items = grouped[type];
                  if (items.length === 0) return null;

                  const globalOffset =
                    type === "vehicle"
                      ? 0
                      : type === "promo"
                        ? grouped.vehicle.length
                        : grouped.vehicle.length + grouped.promo.length;

                  return (
                    <div key={type}>
                      <div className="px-4 pt-3 pb-1">
                        <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                          {TYPE_LABEL[type]}
                        </span>
                      </div>
                      {items.map((entry, localIdx) => {
                        const globalIdx = globalOffset + localIdx + 1;
                        return (
                          <button
                            key={entry.id}
                            data-ocid={`search.item.${globalIdx}`}
                            type="button"
                            onClick={() => handleSuggestionClick(entry)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-100 text-left group"
                          >
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLOR[type]}`}
                            >
                              {entry.category}
                            </span>
                            <span className="text-sm text-gray-800 font-medium group-hover:text-[#C90010] transition-colors truncate">
                              {entry.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
                <div className="border-t border-gray-100 px-4 py-3">
                  <button
                    type="button"
                    onClick={handleShowAll}
                    className="text-sm text-[#C90010] font-semibold hover:underline transition-colors"
                  >
                    Lihat semua hasil untuk &ldquo;{query}&rdquo; →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Popular tags */}
        <div
          className={`flex flex-wrap gap-2 mt-4 ${embedded ? "" : "justify-center"}`}
        >
          {["Xpander", "Pajero Sport", "Promo DP Ringan", "Canter", "L300"].map(
            (tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  navigate({ to: "/search", search: { q: tag } });
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-[#C90010] hover:text-[#C90010] transition-colors duration-150 shadow-sm"
              >
                {tag}
              </button>
            ),
          )}
        </div>
      </motion.div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <section
      data-ocid="search.section"
      className="py-10 md:py-12 bg-[#E5E7EB] relative overflow-hidden"
    >
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#C90010]/10 blur-3xl pointer-events-none" />
      <div className="container mx-auto px-4">{content}</div>
    </section>
  );
}
