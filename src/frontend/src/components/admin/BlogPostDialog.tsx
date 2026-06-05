/**
 * BlogPostDialog — Full-page blog post editor.
 * Rendered at /admin/blog/new and /admin/blog/edit/:id via BlogPostNewPage / BlogPostEditPage.
 * NOT a modal — this is a full admin page wrapped in AdminLayout.
 */

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddBlogPost,
  useGetAllBlogPosts,
  useUpdateBlogPost,
} from "@/hooks/useBlogPosts";
import { useGetAllMediaAssets } from "@/hooks/useMediaAssets";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ── Inline Image Picker ───────────────────────────────────────────────────────
function ImagePickerGrid({
  assets,
  selectedUrl,
  onSelect,
  label,
  previewClass = "w-24 h-24 object-cover rounded border",
}: {
  assets: { id: bigint; storageUrl: string; filename: string }[];
  selectedUrl: string;
  onSelect: (url: string) => void;
  label?: string;
  previewClass?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        data-ocid="blog_editor.image_picker_toggle"
      >
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="text-xs text-gray-600">
          {selectedUrl ? selectedUrl.split("/").pop() : "Pilih gambar..."}
        </span>
      </button>

      {selectedUrl && (
        <div className="relative inline-block">
          <img src={selectedUrl} alt="Preview" className={previewClass} />
          <button
            type="button"
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
            onClick={() => onSelect("")}
            aria-label="Hapus gambar"
          >
            ✕
          </button>
        </div>
      )}

      {open && (
        <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white">
          {assets.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Belum ada gambar di Media Manager.
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {assets.map((asset) => {
                const isSelected = selectedUrl === asset.storageUrl;
                return (
                  <button
                    key={asset.id.toString()}
                    type="button"
                    className={`relative rounded overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? "border-2 border-[#CC0000]"
                        : "border border-transparent"
                    }`}
                    onClick={() => {
                      onSelect(asset.storageUrl);
                      setOpen(false);
                    }}
                  >
                    <img
                      src={asset.storageUrl}
                      alt={asset.filename}
                      className="aspect-square object-cover w-full"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#CC0000]/20">
                        <Check className="h-3 w-3 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Slug generator ────────────────────────────────────────────────────────────
const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();

// ── Toolbar button ────────────────────────────────────────────────────────────
function ToolbarBtn({
  label,
  onClick,
  title,
}: {
  label: string;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title ?? label}
      onClick={onClick}
      className="px-2 py-1 text-sm rounded hover:bg-gray-200 font-medium border border-gray-200 transition-colors"
    >
      {label}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
interface BlogPostDialogProps {
  /** When used as a dialog/modal (legacy), these props allow controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  blogPost?: {
    id: bigint;
    title: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImageId?: string;
    category?: string;
    author?: string;
    authorTitle?: string;
    authorAvatarId?: string;
    tags?: string[];
    published?: boolean;
  } | null;
  onSuccess?: () => void;
}

export default function BlogPostDialog({
  open,
  onOpenChange,
  blogPost: blogPostProp,
  onSuccess,
}: BlogPostDialogProps) {
  // If used as a full-page editor, get id from URL params
  const params = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();

  // Fetch all posts to find the one being edited (by URL param)
  const { data: allPosts = [] } = useGetAllBlogPosts();
  const editPost = params.id
    ? (allPosts.find((p) => String(p.id) === params.id) ?? null)
    : null;

  // Use URL-param post if available, otherwise fall back to prop (legacy modal mode)
  const post = editPost ?? blogPostProp ?? null;
  const isEdit = !!post;

  // Media assets
  const { data: allAssets = [] } = useGetAllMediaAssets();
  const imageAssets = allAssets.filter((a) => a.mimeType.startsWith("image/"));

  // Mutations
  const addBlogPost = useAddBlogPost();
  const updateBlogPost = useUpdateBlogPost();
  const isSubmitting = addBlogPost.isPending || updateBlogPost.isPending;

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [authorTitle, setAuthorTitle] = useState("");
  const [coverImageId, setCoverImageId] = useState("");
  const [authorAvatarId, setAuthorAvatarId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [published, setPublished] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const editorRef = useRef<HTMLDivElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (post) {
      setTitle(post.title ?? "");
      setSlug((post as { slug?: string }).slug ?? "");
      setExcerpt((post as { excerpt?: string }).excerpt ?? "");
      setCategory((post as { category?: string }).category ?? "");
      setAuthor((post as { author?: string }).author ?? "");
      setAuthorTitle((post as { authorTitle?: string }).authorTitle ?? "");
      setCoverImageId((post as { coverImageId?: string }).coverImageId ?? "");
      setAuthorAvatarId(
        (post as { authorAvatarId?: string }).authorAvatarId ?? "",
      );
      setTags((post as { tags?: string[] }).tags ?? []);
      setPublished((post as { published?: boolean }).published ?? false);
      const exc = (post as { excerpt?: string }).excerpt ?? "";
      setCharCount(exc.length);
    } else {
      setTitle("");
      setSlug("");
      setExcerpt("");
      setCategory("");
      setAuthor("");
      setAuthorTitle("");
      setCoverImageId("");
      setAuthorAvatarId("");
      setTags([]);
      setPublished(false);
      setCharCount(0);
    }
  }, [post]);

  // Set rich text editor content when editing
  const postContent = (post as { content?: string } | null)?.content ?? "";
  useEffect(() => {
    if (editorRef.current && isEdit && postContent) {
      if (editorRef.current.innerHTML !== postContent) {
        editorRef.current.innerHTML = postContent;
      }
    }
  }, [isEdit, postContent]);

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value ?? undefined);
    editorRef.current?.focus();
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) setTags([...tags, val]);
      setTagInput("");
    }
  };

  const handleSubmit = async (publishOverride?: boolean) => {
    const finalPublished =
      publishOverride !== undefined ? publishOverride : published;
    const content = editorRef.current?.innerHTML ?? "";

    if (!title.trim()) {
      setErrorMessage("Judul wajib diisi.");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Slug wajib diisi.");
      return;
    }
    if (!category.trim()) {
      setErrorMessage("Kategori wajib diisi.");
      return;
    }
    if (!author.trim()) {
      setErrorMessage("Penulis wajib diisi.");
      return;
    }
    if (!excerpt.trim()) {
      setErrorMessage("Ringkasan wajib diisi.");
      return;
    }
    setErrorMessage("");

    const payload = {
      title,
      slug,
      excerpt,
      content,
      coverImageId,
      category,
      tags,
      author,
      authorTitle,
      authorAvatarId,
      published: finalPublished,
    };

    try {
      if (isEdit && post) {
        await updateBlogPost.mutateAsync({ id: post.id as bigint, ...payload });
      } else {
        await addBlogPost.mutateAsync(payload);
      }
      setSuccessMessage("Post berhasil disimpan!");
      if (onSuccess) onSuccess();
      // Navigate back to list (full-page mode)
      if (params.id !== undefined || !onOpenChange) {
        navigate({ to: "/admin/blog" });
      } else if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (err) {
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
      console.error(err);
    }
  };

  // ── Full-page layout ───────────────────────────────────────────────────────
  const pageContent = (
    <div className="max-w-5xl mx-auto px-4 py-8" data-ocid="blog_editor.page">
      {/* Back link */}
      <Link
        to="/admin/blog"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        data-ocid="blog_editor.back_link"
      >
        ← Kembali ke Daftar Blog
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {isEdit ? "Edit Post" : "Tambah Post Baru"}
      </h1>

      {/* Messages */}
      {successMessage && (
        <div
          className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
          data-ocid="blog_editor.success_state"
        >
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div
          className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
          data-ocid="blog_editor.error_state"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex gap-8 items-start">
        {/* LEFT column */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Cover image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Gambar Cover</Label>
            {coverImageId && (
              <img
                src={coverImageId}
                alt="Cover"
                className="w-full aspect-video object-cover rounded-xl mb-2"
              />
            )}
            <ImagePickerGrid
              assets={imageAssets}
              selectedUrl={coverImageId}
              onSelect={setCoverImageId}
            />
          </div>

          {/* Judul */}
          <div className="space-y-1">
            <Label htmlFor="title" className="text-sm font-medium">
              Judul <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!isEdit) setSlug(generateSlug(e.target.value));
              }}
              className="text-xl font-medium"
              placeholder="Judul artikel..."
              required
              data-ocid="blog_editor.title_input"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <Label htmlFor="slug" className="text-sm font-medium">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-artikel"
              required
              data-ocid="blog_editor.slug_input"
            />
            <p className="text-xs text-gray-400">
              URL publik: /blog/{slug || "…"}
            </p>
          </div>

          {/* Kategori */}
          <div className="space-y-1">
            <Label htmlFor="category" className="text-sm font-medium">
              Kategori <span className="text-red-500">*</span>
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Contoh: Tips, Berita, Review"
              required
              data-ocid="blog_editor.category_input"
            />
          </div>

          {/* Penulis */}
          <div className="space-y-1">
            <Label htmlFor="author" className="text-sm font-medium">
              Penulis <span className="text-red-500">*</span>
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Nama penulis"
              required
              data-ocid="blog_editor.author_input"
            />
          </div>

          {/* Jabatan Penulis */}
          <div className="space-y-1">
            <Label htmlFor="authorTitle" className="text-sm font-medium">
              Jabatan Penulis
            </Label>
            <Input
              id="authorTitle"
              value={authorTitle}
              onChange={(e) => setAuthorTitle(e.target.value)}
              placeholder="Sales Manager, Marketing Team..."
              data-ocid="blog_editor.author_title_input"
            />
          </div>

          {/* Foto Penulis */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Foto Penulis</Label>
            {authorAvatarId && (
              <img
                src={authorAvatarId}
                alt="Author"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            )}
            <ImagePickerGrid
              assets={imageAssets}
              selectedUrl={authorAvatarId}
              onSelect={setAuthorAvatarId}
              previewClass="w-16 h-16 rounded-full object-cover border"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-1">
            <Label htmlFor="excerpt" className="text-sm font-medium">
              Ringkasan <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="excerpt"
              rows={3}
              value={excerpt}
              onChange={(e) => {
                const v = e.target.value.slice(0, 200);
                setExcerpt(v);
                setCharCount(v.length);
              }}
              placeholder="Ringkasan singkat artikel..."
              required
              data-ocid="blog_editor.excerpt_input"
            />
            <p className="text-xs text-gray-400 text-right">
              {charCount}/200 karakter
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags (SEO)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="ml-1 hover:text-red-500"
                    aria-label={`Hapus tag ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Ketik tag lalu tekan Enter..."
              data-ocid="blog_editor.tag_input"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-0">
            <Label className="text-sm font-medium block mb-2">
              Konten Artikel
            </Label>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 border border-gray-200 rounded-t-lg p-2 bg-gray-50">
              <ToolbarBtn
                label="B"
                title="Bold"
                onClick={() => execCmd("bold")}
              />
              <ToolbarBtn
                label="I"
                title="Italic"
                onClick={() => execCmd("italic")}
              />
              <ToolbarBtn
                label="U"
                title="Underline"
                onClick={() => execCmd("underline")}
              />
              <ToolbarBtn
                label="H2"
                title="Heading 2"
                onClick={() => execCmd("formatBlock", "h2")}
              />
              <ToolbarBtn
                label="H3"
                title="Heading 3"
                onClick={() => execCmd("formatBlock", "h3")}
              />
              <ToolbarBtn
                label="&ldquo;"
                title="Blockquote"
                onClick={() => execCmd("formatBlock", "blockquote")}
              />
              <ToolbarBtn
                label="UL"
                title="Bullet list"
                onClick={() => execCmd("insertUnorderedList")}
              />
              <ToolbarBtn
                label="OL"
                title="Numbered list"
                onClick={() => execCmd("insertOrderedList")}
              />
              <ToolbarBtn
                label="Link"
                title="Insert link"
                onClick={() => {
                  const url = window.prompt("URL:");
                  if (url) execCmd("createLink", url);
                }}
              />
              <ToolbarBtn
                label="✕ Format"
                title="Remove formatting"
                onClick={() => execCmd("removeFormat")}
              />
            </div>
            {/* Editor area */}
            <div
              ref={editorRef}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: contentEditable needs tabindex for keyboard access
              tabIndex={0}
              contentEditable
              suppressContentEditableWarning
              className="border border-t-0 border-gray-200 rounded-b-lg p-4 min-h-[400px] focus:outline-none text-gray-800 leading-relaxed prose max-w-none"
              data-ocid="blog_editor.editor"
            />
          </div>
        </div>

        {/* RIGHT column — Publication card */}
        <div className="w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm sticky top-6">
            <p className="font-semibold text-gray-900 mb-4">Publikasi</p>

            {/* Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-700">
                {published ? "Publish" : "Draft"}
              </span>
              <button
                type="button"
                onClick={() => setPublished(!published)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  published ? "bg-[#CC0000]" : "bg-gray-200"
                }`}
                data-ocid="blog_editor.publish_toggle"
                aria-label="Toggle publikasi"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    published ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Status badge */}
            <div className="mb-6">
              {published ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Akan Dipublikasikan
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  Draft
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="w-full px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                data-ocid="blog_editor.save_draft_button"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Draft"}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-[#CC0000] text-white hover:bg-[#AA0000] transition-colors disabled:opacity-50"
                data-ocid="blog_editor.publish_button"
              >
                {isSubmitting ? "Menyimpan..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Legacy modal mode (for BlogPostNewPage / BlogPostEditPage) ─────────────
  // When `open` prop is passed, it was previously rendered as a Dialog.
  // We now render the full-page content directly (the route pages handle navigation).
  if (open !== undefined) {
    return pageContent;
  }

  return pageContent;
}
