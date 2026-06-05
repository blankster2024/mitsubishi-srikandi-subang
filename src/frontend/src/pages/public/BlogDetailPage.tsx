import {
  useAddBlogComment,
  useGetApprovedCommentsByPostId,
} from "@/hooks/useBlogComments";
import {
  useGetPublishedBlogPosts,
  useLikeBlogPost,
} from "@/hooks/useBlogPosts";
import type { BlogComment, BlogPost } from "@/types/local";
import {
  ChatBubbleOvalLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  HeartIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

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
  return name ? name.charAt(0).toUpperCase() : "?";
}

// ─────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
      <div className="h-6 w-24 bg-red-100 rounded-full mt-4" />
      <div className="h-10 w-4/5 bg-gray-200 rounded mt-4" />
      <div className="h-10 w-3/4 bg-gray-200 rounded mt-2" />
      <div className="flex items-center gap-3 mt-6">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </div>
      <div className="w-full aspect-video bg-gray-200 rounded-2xl mt-8" />
      <div className="mt-10 space-y-3">
        {(["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"] as const).map(
          (id) => (
            <div
              key={id}
              className={`h-4 bg-gray-200 rounded ${["l4", "l8"].includes(id) ? "w-3/4" : "w-full"}`}
            />
          ),
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Related Post Card
// ─────────────────────────────────────────────────────────────

function RelatedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white border border-gray-100 block group"
      data-ocid={`blog.related.${post.slug}`}
    >
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
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
        )}
        {post.category && (
          <span className="absolute bottom-3 left-3 bg-[#CC0000] text-white text-xs px-2 py-1 rounded-full font-medium">
            {post.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <ClockIcon className="w-3.5 h-3.5" />
          <span>{Number(post.readTimeMinutes)} menit baca</span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#CC0000] transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// Single Comment (recursive for replies)
// ─────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: BlogComment;
  replies: BlogComment[];
  allComments: BlogComment[];
  postId: bigint;
  replyTo: bigint | null;
  setReplyTo: (id: bigint | null) => void;
}

function CommentItem({
  comment,
  replies,
  allComments,
  postId,
  replyTo,
  setReplyTo,
}: CommentItemProps) {
  const addCommentMutation = useAddBlogComment();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleReplySubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !email.trim() || !content.trim()) return;
      addCommentMutation.mutate(
        {
          postId,
          parentId: comment.id,
          name: name.trim(),
          email: email.trim(),
          content: content.trim(),
        },
        {
          onSuccess: () => {
            setSubmitted(true);
            setName("");
            setEmail("");
            setContent("");
          },
        },
      );
    },
    [addCommentMutation, postId, comment.id, name, email, content],
  );

  return (
    <div className="mb-6">
      {/* Comment */}
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {getInitial(comment.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">
              {comment.name}
            </span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-xs text-gray-400">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {comment.content}
          </p>
          <button
            type="button"
            onClick={() =>
              setReplyTo(replyTo === comment.id ? null : comment.id)
            }
            className="text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors"
            data-ocid="blog.comment.reply_button"
          >
            Balas
          </button>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-10 mt-3 space-y-4">
          {replies.map((reply) => {
            const subReplies = allComments.filter(
              (c) => c.parentId !== null && c.parentId === reply.id,
            );
            return (
              <div key={String(reply.id)} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {getInitial(reply.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-gray-900">
                      {reply.name}
                    </span>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-xs text-gray-400">
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {reply.content}
                  </p>
                  {subReplies.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      {subReplies.length} balasan lanjutan
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Reply Form */}
      {replyTo === comment.id && (
        <div className="mt-3 ml-10 bg-gray-50 p-4 rounded-lg">
          {submitted ? (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
              Balasan Anda sedang menunggu moderasi.
            </p>
          ) : (
            <form onSubmit={handleReplySubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nama *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000] bg-white"
                  data-ocid="blog.reply.name_input"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000] bg-white"
                  data-ocid="blog.reply.email_input"
                />
              </div>
              <textarea
                placeholder="Tulis balasan *"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CC0000] resize-none bg-white"
                data-ocid="blog.reply.content_textarea"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={addCommentMutation.isPending}
                  className="bg-[#CC0000] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  data-ocid="blog.reply.submit_button"
                >
                  {addCommentMutation.isPending
                    ? "Mengirim..."
                    : "Kirim Balasan"}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  data-ocid="blog.reply.cancel_button"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function BlogDetailPage() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const cleanSlug = (slug ?? "").trim();

  const {
    data: allPostsData,
    isLoading,
    isPending,
  } = useGetPublishedBlogPosts();
  const { data: allPosts = [] } = useGetPublishedBlogPosts();
  const post = allPostsData?.find((p) => p.slug === cleanSlug) ?? null;
  const { data: comments = [] } = useGetApprovedCommentsByPostId(
    post?.id ?? null,
  );
  const likeMutation = useLikeBlogPost();
  const addCommentMutation = useAddBlogComment();

  // Like state
  const [hasLiked, setHasLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);

  // Share popover & toast
  const [showSharePopover, setShowSharePopover] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  // Comment form
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  // Reply state
  const [replyTo, setReplyTo] = useState<bigint | null>(null);

  // Sync post data
  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} — ${siteName}`;
    setLocalLikeCount(Number(post.likeCount));
    setHasLiked(
      localStorage.getItem(`liked_post_${String(post.id)}`) === "true",
    );
  }, [post]);

  // Close share popover on outside click
  useEffect(() => {
    if (!showSharePopover) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowSharePopover(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSharePopover]);

  const handleLike = useCallback(() => {
    if (!post || hasLiked) return;
    setHasLiked(true);
    setLocalLikeCount((prev) => prev + 1);
    localStorage.setItem(`liked_post_${String(post.id)}`, "true");
    likeMutation.mutate(post.id);
  }, [post, hasLiked, likeMutation]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShowToast(true);
      setShowSharePopover(false);
      setTimeout(() => setShowToast(false), 2500);
    });
  }, []);

  const handleCommentSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!post) return;
      if (!commentName.trim() || !commentEmail.trim() || !commentContent.trim())
        return;
      try {
        await addCommentMutation.mutateAsync({
          postId: post.id,
          parentId: null,
          name: commentName.trim(),
          email: commentEmail.trim(),
          content: commentContent.trim(),
        });
        setCommentSubmitted(true);
        setCommentName("");
        setCommentEmail("");
        setCommentContent("");
      } catch (err) {
        console.error("Gagal kirim komentar:", err);
      }
    },
    [post, commentName, commentEmail, commentContent, addCommentMutation],
  );

  // ── Guard: no slug ───────────────────────────────────────
  if (!cleanSlug) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-sm">URL artikel tidak valid.</p>
        <Link
          to="/blog"
          className="text-[#CC0000] font-medium hover:underline text-sm mt-4 inline-block"
        >
          ← Kembali ke Blog
        </Link>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────
  if (isLoading || isPending || allPostsData === undefined)
    return <DetailSkeleton />;

  // ── Not Found ────────────────────────────────────────────
  if (post === null) {
    return (
      <div
        className="max-w-3xl mx-auto px-4 py-20 text-center"
        data-ocid="blog.detail.not_found"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Artikel tidak ditemukan
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Artikel yang Anda cari tidak tersedia atau telah dihapus.
        </p>
        <Link
          to="/blog"
          className="text-[#CC0000] font-medium hover:underline text-sm"
        >
          ← Kembali ke Blog
        </Link>
      </div>
    );
  }

  // Related posts
  const relatedPosts = (() => {
    if (allPosts.length === 0) return [];
    const sameCategory = allPosts.filter(
      (p) => p.category === post.category && String(p.id) !== String(post.id),
    );
    const others = allPosts.filter(
      (p) => p.category !== post.category && String(p.id) !== String(post.id),
    );
    return [...sameCategory, ...others].slice(0, 3);
  })();

  // Build root comments and replies
  const rootComments = comments
    .filter((c) => c.parentId === null || c.parentId === undefined)
    .sort((a, b) => Number(a.createdAt) - Number(b.createdAt));

  const getReplies = (commentId: bigint) =>
    comments
      .filter(
        (c) => c.parentId !== null && String(c.parentId) === String(commentId),
      )
      .sort((a, b) => Number(a.createdAt) - Number(b.createdAt));

  return (
    <>
      {/* Inline CSS for blog content */}
      <style>{`
        .blog-content h2 { font-size: 1.25rem; font-weight: 700; color: #111827; margin-top: 2rem; margin-bottom: 0.75rem; }
        .blog-content h3 { font-size: 1.1rem; font-weight: 600; color: #1f2937; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .blog-content p { color: #374151; line-height: 1.75; margin-bottom: 1rem; }
        .blog-content ul, .blog-content ol { padding-left: 1.5rem; margin-bottom: 1rem; color: #374151; }
        .blog-content li { margin-bottom: 0.25rem; }
        .blog-content blockquote { border-left: 4px solid #CC0000; padding-left: 1rem; font-style: italic; color: #6b7280; margin: 1.5rem 0; }
        .blog-content a { color: #CC0000; text-decoration: underline; }
        .blog-content strong { font-weight: 600; color: #111827; }
        .blog-content img { border-radius: 0.75rem; width: 100%; margin: 1.5rem 0; }
        .blog-content code { background: #f3f4f6; font-size: 0.875rem; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace; }
      `}</style>

      {/* ── SECTION 1: Main Content ────────────────────────── */}
      <div
        className="max-w-4xl mx-auto px-4 py-8 md:py-10"
        data-ocid="blog.detail.page"
      >
        {/* 1. Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-sm text-gray-400"
          aria-label="breadcrumb"
        >
          <Link
            to="/blog"
            className="hover:text-[#CC0000] transition-colors"
            data-ocid="blog.detail.breadcrumb_blog"
          >
            Blog
          </Link>
          <ChevronRightIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-gray-500 truncate">{post.category}</span>
        </nav>

        {/* 2. Category Badge */}
        {post.category && (
          <span className="inline-block bg-red-100 text-[#CC0000] text-xs font-semibold px-3 py-1 rounded-full mt-4 uppercase tracking-wide">
            {post.category}
          </span>
        )}

        {/* 3. Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-3">
          {post.title}
        </h1>

        {/* 4. Meta Row */}
        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500">
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
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {getInitial(post.author)}
            </div>
          )}
          <span className="font-semibold text-gray-700">{post.author}</span>
          {post.authorTitle && (
            <>
              <span className="text-gray-300">·</span>
              <span>{post.authorTitle}</span>
            </>
          )}
          <span className="text-gray-300">·</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span className="text-gray-300">·</span>
          <span className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            {Number(post.readTimeMinutes)} menit baca
          </span>
        </div>

        {/* 5. Cover Image */}
        <div className="mt-8">
          {post.coverImageId ? (
            <img
              src={post.coverImageId}
              alt={post.title}
              className="w-full aspect-video object-cover rounded-2xl shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300" />
          )}
        </div>

        {/* 6. Article Content */}
        <div
          className="blog-content mt-10"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: admin-authored blog content rendered as HTML
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 7. Action Bar */}
        <div className="flex items-center gap-6 py-6 border-t border-b border-gray-100 my-8">
          {/* Like */}
          {hasLiked ? (
            <span
              className="flex items-center gap-1.5 text-red-500 text-sm select-none"
              data-ocid="blog.detail.liked_indicator"
            >
              <HeartIconSolid className="w-5 h-5" />
              {localLikeCount}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleLike}
              className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors cursor-pointer text-sm"
              aria-label="Suka artikel ini"
              data-ocid="blog.detail.like_button"
            >
              <HeartIcon className="w-5 h-5" />
              {localLikeCount}
            </button>
          )}

          {/* Comment scroll */}
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("comments-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-1.5 text-gray-500 hover:text-[#CC0000] transition-colors text-sm"
            aria-label="Lihat komentar"
            data-ocid="blog.detail.comments_button"
          >
            <ChatBubbleOvalLeftIcon className="w-5 h-5" />
            {Number(post.commentCount)}
          </button>

          {/* Share */}
          <div className="relative" ref={shareRef}>
            <button
              type="button"
              onClick={() => setShowSharePopover((v) => !v)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-[#CC0000] transition-colors text-sm"
              aria-label="Bagikan artikel"
              data-ocid="blog.detail.share_button"
            >
              <ShareIcon className="w-5 h-5" />
              Bagikan
            </button>
            {showSharePopover && (
              <div
                className="absolute left-0 top-8 bg-white shadow-lg rounded-lg py-2 w-44 z-10 border border-gray-100"
                data-ocid="blog.detail.share_popover"
              >
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  data-ocid="blog.detail.share_copy_link"
                >
                  Salin Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(`${post.title} ${window.location.href}`)}`,
                      "_blank",
                    );
                    setShowSharePopover(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  data-ocid="blog.detail.share_whatsapp"
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                      "_blank",
                    );
                    setShowSharePopover(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  data-ocid="blog.detail.share_facebook"
                >
                  Facebook
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 8. CTA Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-white text-center my-8">
          <h3 className="text-xl font-bold">Tertarik dengan kendaraan kami?</h3>
          <p className="text-white/80 mt-2 text-sm">
            Konsultasikan kebutuhan Anda dengan tim sales kami secara gratis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Link
              to="/kontak"
              className="bg-white text-[#CC0000] px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors text-center"
              data-ocid="blog.cta.contact_button"
            >
              Hubungi Sales Sekarang
            </Link>
            <Link
              to="/mobil-keluarga"
              className="border border-white text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors text-center"
              data-ocid="blog.cta.catalog_button"
            >
              Lihat Katalog
            </Link>
          </div>
        </div>

        {/* 9. Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <span className="text-sm text-gray-500 mr-1">Tags:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 10. Comments Section */}
        <section
          id="comments-section"
          className="mt-12 border-t border-gray-200 pt-10"
          data-ocid="blog.comments.section"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Komentar ({rootComments.length})
          </h2>

          {/* Comment List */}
          {rootComments.length === 0 ? (
            <p
              className="text-gray-400 text-sm text-center py-8 italic"
              data-ocid="blog.comments.empty_state"
            >
              Belum ada komentar. Jadilah yang pertama!
            </p>
          ) : (
            <div>
              {rootComments.map((comment) => (
                <CommentItem
                  key={String(comment.id)}
                  comment={comment}
                  replies={getReplies(comment.id)}
                  allComments={comments}
                  postId={post.id}
                  replyTo={replyTo}
                  setReplyTo={setReplyTo}
                />
              ))}
            </div>
          )}

          {/* New Comment Form */}
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Tinggalkan Komentar
            </h3>
            {commentSubmitted ? (
              <div
                className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-sm"
                data-ocid="blog.comment.success_state"
              >
                Komentar Anda sedang menunggu moderasi.
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Nama *"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
                      data-ocid="blog.comment.name_input"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email *"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] transition-colors"
                      data-ocid="blog.comment.email_input"
                    />
                  </div>
                  <p className="text-xs text-gray-400 md:col-span-2 -mt-2">
                    Email tidak akan ditampilkan
                  </p>
                  <div className="md:col-span-2">
                    <textarea
                      placeholder="Tuliskan komentar Anda *"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      required
                      rows={4}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#CC0000] transition-colors resize-none"
                      data-ocid="blog.comment.content_textarea"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={addCommentMutation.isPending}
                  className="mt-4 bg-[#CC0000] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                  data-ocid="blog.comment.submit_button"
                >
                  {addCommentMutation.isPending
                    ? "Mengirim..."
                    : "Kirim Komentar"}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* ── SECTION 2: Related Posts ───────────────────────── */}
      {relatedPosts.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50/60 mt-4">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Artikel Terkait
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <RelatedCard key={String(p.id)} post={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <output
          className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg"
          data-ocid="blog.toast.copy_success"
          aria-live="polite"
        >
          Link disalin!
        </output>
      )}
    </>
  );
}
