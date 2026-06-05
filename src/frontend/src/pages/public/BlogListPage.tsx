import { useGetPublishedBlogPosts } from "@/hooks/useBlogPosts";
import type { BlogPost } from "@/types/local";
import { HeartIcon } from "@heroicons/react/24/outline";
import { ClockIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const siteName = "Mitsubishi Srikandi Subang";

function formatDate(ns: bigint): string {
  return new Date(Number(ns) / 1_000_000).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitial(name: string): string {
  return name ? name.charAt(0).toUpperCase() : "A";
}

// ─────────────────────────────────────────────────────────────
// Skeleton Card
// ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
      <div className="bg-gray-200 animate-pulse h-40 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded" />
        <div className="space-y-2 mt-3">
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-4/5 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="space-y-1.5 mt-2">
          <div className="h-3 w-full bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-full bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Article Card
// ─────────────────────────────────────────────────────────────

function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 block group"
      data-ocid={`blog.card.${post.slug}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-video">
        {post.coverImageId ? (
          <img
            src={post.coverImageId}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-xs">Tidak ada gambar</span>
          </div>
        )}
        {post.category && (
          <span className="absolute bottom-3 left-3 bg-[#CC0000] text-white text-xs px-2 py-1 rounded-full font-medium">
            {post.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{formatDate(post.publishedAt)}</span>
          <span>·</span>
          <ClockIcon className="w-3.5 h-3.5" />
          <span>{Number(post.readTimeMinutes)} menit baca</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 mt-2 leading-snug line-clamp-2 group-hover:text-[#CC0000] transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 mt-4 pt-4">
          <div className="flex items-center justify-between">
            {/* Author */}
            <div className="flex items-center gap-2">
              {post.authorAvatarId ? (
                <img
                  src={post.authorAvatarId}
                  alt={post.author}
                  className="w-6 h-6 rounded-full object-cover bg-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-semibold flex-shrink-0">
                  {getInitial(post.author)}
                </div>
              )}
              <span className="text-xs text-gray-600 truncate max-w-[100px]">
                {post.author}
              </span>
            </div>

            {/* Like count */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <HeartIcon className="w-3.5 h-3.5" />
              <span>{Number(post.likeCount)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// Featured Post
// ─────────────────────────────────────────────────────────────

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <div className="mb-2">
      <p className="text-sm font-semibold text-[#CC0000] uppercase tracking-wide mb-4">
        Artikel Terbaru
      </p>
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        className="flex flex-col md:flex-row gap-6 md:gap-10 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 group"
        data-ocid="blog.featured.card"
      >
        {/* Left — Image */}
        <div className="relative md:w-3/5 h-64 md:h-auto md:min-h-[320px] overflow-hidden">
          {post.coverImageId ? (
            <img
              src={post.coverImageId}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
          )}
          {post.category && (
            <span className="absolute top-4 left-4 bg-[#CC0000] text-white text-xs px-3 py-1 rounded-full uppercase font-medium">
              {post.category}
            </span>
          )}
        </div>

        {/* Right — Content */}
        <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight line-clamp-3">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-4">
              {post.excerpt}
            </p>
          )}

          {/* Author row */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            {post.authorAvatarId ? (
              <img
                src={post.authorAvatarId}
                alt={post.author}
                className="w-8 h-8 rounded-full object-cover bg-gray-200 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-600 font-semibold flex-shrink-0">
                {getInitial(post.author)}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-700">
              {post.author}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-400">
              {formatDate(post.publishedAt)}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {Number(post.readTimeMinutes)} menit baca
            </span>
          </div>

          <span className="text-[#CC0000] font-semibold text-sm mt-4 hover:underline inline-block">
            Baca Selengkapnya →
          </span>
        </div>
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function BlogListPage() {
  const { data: posts, isLoading } = useGetPublishedBlogPosts();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = `Blog & Artikel — ${siteName}`;
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMobileDropdownOpen(false);
      }
    }
    if (mobileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileDropdownOpen]);

  const categories = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set((posts ?? []).map((p) => p.category).filter(Boolean)),
      ),
    ],
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (posts ?? []).filter((p) => {
      const matchCategory =
        activeCategory === "all" || p.category === activeCategory;
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [posts, searchQuery, activeCategory]);

  const featuredPost = filteredPosts[0] as BlogPost | undefined;
  const gridPosts = filteredPosts.slice(1);

  const activeCategoryLabel =
    activeCategory === "all" ? "Semua" : activeCategory;

  return (
    <main className="pb-16 md:pb-0">
      {/* ── HERO SECTION ── */}
      <section
        aria-label="Hero Blog"
        className="h-[150px] md:h-[250px] bg-[#CC0000] flex items-center justify-center"
      >
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
            <BookOpen
              className="w-6 h-6 md:w-8 md:h-8 text-white"
              aria-hidden="true"
            />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
              Blog & Artikel
            </h1>
          </div>
          <p className="text-sm md:text-lg max-w-2xl mx-auto opacity-90 text-white">
            Tips dan informasi seputar Mitsubishi dan dunia otomotif.
          </p>
        </div>
      </section>

      {/* ── CATEGORY FILTER + SEARCH ── */}
      <div className="bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-6 flex items-center justify-between gap-4">
          {/* ── MOBILE: Dropdown filter (below md) ── */}
          <div
            className="relative md:hidden flex-1"
            ref={dropdownRef}
            data-ocid="blog.category_filter"
          >
            <button
              type="button"
              onClick={() => setMobileDropdownOpen((v) => !v)}
              className="flex items-center justify-between w-full px-4 py-2 rounded-sm border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              data-ocid="blog.category_dropdown_toggle"
            >
              <span>{activeCategoryLabel}</span>
              <ChevronDown
                className={`w-4 h-4 ml-2 text-gray-500 transition-transform duration-200 ${
                  mobileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu with slide-down animation */}
            <div
              className={`absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden transition-all duration-300 origin-top ${
                mobileDropdownOpen
                  ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
              }`}
              style={{ transformOrigin: "top" }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setMobileDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-[#CC0000] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  data-ocid={`blog.category.${cat}`}
                >
                  {cat === "all" ? "Semua" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* ── DESKTOP: Horizontal tab filter (md and above) ── */}
          <div
            className="hidden md:flex flex-wrap gap-2 flex-1"
            data-ocid="blog.category_filter_desktop"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-5 py-2 rounded-sm text-sm font-medium transition-colors duration-200 ${
                  activeCategory === cat
                    ? "bg-[#CC0000] text-white"
                    : "border border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
                data-ocid={`blog.category.${cat}`}
              >
                {cat === "all" ? "Semua" : cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari artikel..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm w-full focus:outline-none focus:border-[#CC0000] transition-colors"
              data-ocid="blog.search_input"
            />
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Post */}
        {!isLoading && featuredPost && <FeaturedPost post={featuredPost} />}

        {/* Grid Divider label */}
        {!isLoading && gridPosts.length > 0 && (
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-10 mb-6">
            Semua Artikel
          </p>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
              <SkeletonCard key={k} />
            ))}
          </div>
        )}

        {/* Article Grid */}
        {!isLoading && gridPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {gridPosts.map((post) => (
              <ArticleCard key={String(post.id)} post={post} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <div
            className="text-center py-20 text-gray-400"
            data-ocid="blog.empty_state"
          >
            <p className="text-lg">Belum ada artikel.</p>
            {(searchQuery || activeCategory !== "all") && (
              <p className="text-sm mt-2">
                Coba ubah filter atau kata kunci pencarian.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
