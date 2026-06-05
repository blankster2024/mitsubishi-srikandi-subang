import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActorContext } from "@/contexts/ActorContext";
import { useGetAllMediaAssets } from "@/hooks/useMediaAssets";
import { useAddPromo, useUpdatePromo } from "@/hooks/usePromotions";
import type { Promotion } from "@/types/local";
import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ── Rich Text Editor Toolbar Button ────────────────────────────────────
function ToolbarBtn({
  label,
  title,
  onClick,
}: {
  label: string;
  title?: string;
  onClick: () => void;
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

interface PromoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  promo?: Promotion | null;
}

// ── Image Picker (inline) ──────────────────────────────────────────────────────
function ImagePickerGrid({
  assets,
  selectedUrl,
  onSelect,
  label,
}: {
  assets: { id: bigint; storageUrl: string; filename: string }[];
  selectedUrl: string;
  onSelect: (url: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 h-9"
        onClick={() => setOpen((v) => !v)}
        data-ocid="promo.image_picker_toggle"
      >
        <svg
          className="h-4 w-4 shrink-0 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="truncate text-xs">
          {selectedUrl ? selectedUrl.split("/").pop() : "Pilih gambar..."}
        </span>
      </Button>

      {selectedUrl && (
        <div className="relative inline-block">
          <img
            src={selectedUrl}
            alt="Preview"
            className="w-24 h-24 object-cover rounded border"
          />
          <button
            type="button"
            className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-4 h-4 text-xs flex items-center justify-center leading-none"
            onClick={() => onSelect("")}
            aria-label="Hapus gambar"
          >
            ✕
          </button>
        </div>
      )}

      {open && (
        <div className="max-h-64 overflow-y-auto border rounded-lg p-2 bg-card">
          {assets.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Belum ada gambar di Media Manager.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {assets.map((asset) => {
                const isSelected = selectedUrl === asset.storageUrl;
                return (
                  <button
                    key={asset.id.toString()}
                    type="button"
                    className={`relative rounded overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? "border-2 border-red-600"
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
                      <div className="absolute inset-0 flex items-center justify-center bg-red-600/20">
                        <Check className="h-4 w-4 text-white drop-shadow" />
                      </div>
                    )}
                    <p className="truncate text-xs text-center mt-1 px-0.5">
                      {asset.filename}
                    </p>
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

// ── Slug generator ─────────────────────────────────────────────────────────────
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

// ── Date conversion ────────────────────────────────────────────────────────────
function nsToDateStr(ns: bigint): string {
  return new Date(Number(ns) / 1_000_000).toISOString().split("T")[0];
}

function dateStrToNs(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

// ── unwrap Candid optional ─────────────────────────────────────────────────────
function unwrapOptText(val: [] | [string] | string | null | undefined): string {
  if (Array.isArray(val)) return val[0] ?? "";
  return val ?? "";
}

// ── Main Dialog ────────────────────────────────────────────────────────────────
export default function PromoDialog({
  isOpen,
  onClose,
  promo,
}: PromoDialogProps) {
  const isEdit = !!promo;

  // ── All hooks must be called before any early return ──────────────────────

  // Media assets for image picker
  const { data: allAssets = [] } = useGetAllMediaAssets();
  const imageAssets = (allAssets ?? []).filter((a) =>
    a.mimeType.startsWith("image/"),
  );

  // Mutations
  const addPromo = useAddPromo();
  const updatePromo = useUpdatePromo();
  const isSubmitting = addPromo.isPending || updatePromo.isPending;
  const { isBootstrapped } = useActorContext();

  // ── Form state ────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [active, setActive] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const editorRef = useRef<HTMLDivElement>(null);

  // ── Reset/populate form on dialog open ────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setSubmitError("");

    if (promo) {
      setTitle(promo.title ?? "");
      setSlug(promo.slug ?? "");
      setDescription(promo.description ?? "");
      setImageUrl(unwrapOptText(promo.imageId));
      setStartDate(promo.startDate ? nsToDateStr(promo.startDate) : "");
      setEndDate(promo.endDate ? nsToDateStr(promo.endDate) : "");
      setTermsAndConditions(promo.termsAndConditions ?? "");
      setActive(promo.active ?? false);
      setTags(promo.tags ?? []);
      setTagInput("");
    } else {
      setTitle("");
      setSlug("");
      setDescription("");
      setImageUrl("");
      setStartDate("");
      setEndDate("");
      setTermsAndConditions("");
      setActive(false);
      setTags([]);
      setTagInput("");
    }
  }, [isOpen, promo]);

  // Sync rich text editor content when editing
  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = promo ? (promo.description ?? "") : "";
      }
    }, 0);
  }, [isOpen, promo]);

  // ── Guard: render nothing when dialog is closed ───────────────────────────────
  if (!isOpen) return null;

  // ── Tag management ─────────────────────────────────────────────────────────────
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) setTags([...tags, val]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  // ── Validate ───────────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Judul wajib diisi";
    if (!slug.trim()) newErrors.slug = "Slug wajib diisi";
    const editorContent = editorRef.current?.innerHTML ?? description;
    if (!editorContent.trim() || editorContent === "<br>")
      newErrors.description = "Deskripsi wajib diisi";
    if (!startDate) newErrors.startDate = "Tanggal mulai wajib diisi";
    if (!endDate) newErrors.endDate = "Tanggal berakhir wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) {
      toast.error("Harap lengkapi semua field yang wajib diisi.");
      return;
    }

    const params = {
      title: title.trim(),
      slug: slug.trim(),
      description: (editorRef.current?.innerHTML ?? description).trim(),
      // Pass string | null — hook converts: null → [], "val" → ["val"]
      imageId: imageUrl.trim() || null,
      vehicleRef: null,
      vehicleRefType: null,
      // dateStrToNs already returns bigint
      startDate: dateStrToNs(startDate),
      endDate: dateStrToNs(endDate),
      termsAndConditions: termsAndConditions.trim(),
      tags,
      active: active === true,
    };

    try {
      if (isEdit && promo) {
        await updatePromo.mutateAsync({ id: promo.id, ...params });
        toast.success("Promo berhasil diperbarui");
      } else {
        await addPromo.mutateAsync(params);
        toast.success("Promo berhasil ditambahkan");
      }
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan tak dikenal";
      setSubmitError(`Gagal menyimpan promo: ${message}`);
      toast.error("Gagal menyimpan promo. Periksa koneksi dan coba lagi.");
      console.error("Promo save error:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1100px] w-full flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>
            {isEdit ? "Edit Promo" : "Tambah Promo Baru"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 px-6 max-h-[80vh] overflow-y-auto">
          {/* Mutation error banner */}
          {submitError && (
            <div
              className="mt-4 rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
              data-ocid="promo.error_state"
            >
              {submitError}
            </div>
          )}

          <form id="promo-form" onSubmit={handleSubmit}>
            <div className="space-y-5 py-4">
              {/* 1. Judul */}
              <div className="grid gap-2">
                <Label htmlFor="promo-title">
                  Judul <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="promo-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title)
                      setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  placeholder="Contoh: Promo Akhir Tahun Mitsubishi"
                  disabled={isSubmitting}
                  data-ocid="promo.input"
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="promo.title.field_error"
                  >
                    {errors.title}
                  </p>
                )}
              </div>

              {/* 2. Gambar */}
              <ImagePickerGrid
                assets={imageAssets}
                selectedUrl={imageUrl}
                onSelect={setImageUrl}
                label="Gambar Promo"
              />

              {/* 3. Deskripsi */}
              <div className="grid gap-2">
                <Label htmlFor="promo-description">
                  Deskripsi <span className="text-destructive">*</span>
                </Label>
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 border border-gray-200 rounded-t-lg p-2 bg-gray-50">
                  <ToolbarBtn
                    label="B"
                    title="Bold"
                    onClick={() => {
                      document.execCommand("bold", false);
                      editorRef.current?.focus();
                    }}
                  />
                  <ToolbarBtn
                    label="I"
                    title="Italic"
                    onClick={() => {
                      document.execCommand("italic", false);
                      editorRef.current?.focus();
                    }}
                  />
                  <ToolbarBtn
                    label="U"
                    title="Underline"
                    onClick={() => {
                      document.execCommand("underline", false);
                      editorRef.current?.focus();
                    }}
                  />
                  <ToolbarBtn
                    label="UL"
                    title="Bullet list"
                    onClick={() => {
                      document.execCommand("insertUnorderedList", false);
                      editorRef.current?.focus();
                    }}
                  />
                  <ToolbarBtn
                    label="OL"
                    title="Numbered list"
                    onClick={() => {
                      document.execCommand("insertOrderedList", false);
                      editorRef.current?.focus();
                    }}
                  />
                  <ToolbarBtn
                    label="✕ Format"
                    title="Remove formatting"
                    onClick={() => {
                      document.execCommand("removeFormat", false);
                      editorRef.current?.focus();
                    }}
                  />
                </div>
                {/* Editor area */}
                <div
                  ref={editorRef}
                  id="promo-description"
                  // biome-ignore lint/a11y/noNoninteractiveTabindex: contentEditable needs tabindex
                  tabIndex={0}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => {
                    const val = editorRef.current?.innerHTML ?? "";
                    setDescription(val);
                    if (errors.description)
                      setErrors((prev) => ({ ...prev, description: "" }));
                  }}
                  aria-label="Deskripsi promo"
                  aria-invalid={!!errors.description}
                  data-ocid="promo.editor"
                  className={`border border-t-0 rounded-b-lg p-3 min-h-[160px] focus:outline-none text-gray-800 leading-relaxed prose max-w-none text-sm ${
                    errors.description
                      ? "border-destructive"
                      : "border-gray-200"
                  }`}
                />
                {errors.description && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="promo.description.field_error"
                  >
                    {errors.description}
                  </p>
                )}
              </div>

              {/* 4. Tanggal Mulai & Berakhir */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="promo-start-date">
                    Tanggal Mulai <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="promo-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (errors.startDate)
                        setErrors((prev) => ({ ...prev, startDate: "" }));
                    }}
                    disabled={isSubmitting}
                    data-ocid="promo.start_date_input"
                    aria-invalid={!!errors.startDate}
                  />
                  {errors.startDate && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="promo.startDate.field_error"
                    >
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="promo-end-date">
                    Tanggal Berakhir <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="promo-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (errors.endDate)
                        setErrors((prev) => ({ ...prev, endDate: "" }));
                    }}
                    disabled={isSubmitting}
                    data-ocid="promo.end_date_input"
                    aria-invalid={!!errors.endDate}
                  />
                  {errors.endDate && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="promo.endDate.field_error"
                    >
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* 7. Syarat & Ketentuan */}
              <div className="grid gap-2">
                <Label htmlFor="promo-terms">Syarat &amp; Ketentuan</Label>
                <Textarea
                  id="promo-terms"
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  rows={4}
                  placeholder="Isi syarat dan ketentuan promo..."
                  disabled={isSubmitting}
                />
              </div>

              {/* 8. Status Aktif */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="promo-active"
                  checked={active}
                  onCheckedChange={(v) => setActive(v === true)}
                  disabled={isSubmitting}
                  data-ocid="promo.checkbox"
                />
                <Label
                  htmlFor="promo-active"
                  className="cursor-pointer font-medium"
                >
                  Aktif
                </Label>
                <span className="text-xs text-muted-foreground">
                  Promo akan ditampilkan di halaman publik jika diaktifkan
                </span>
              </div>

              {/* 9. Tags */}
              <div className="grid gap-2">
                <Label>Tags (SEO)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Ketik tag lalu tekan Enter"
                    disabled={isSubmitting}
                    className="flex-1"
                    data-ocid="promo.tag_input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const val = tagInput.trim();
                      if (val && !tags.includes(val)) setTags([...tags, val]);
                      setTagInput("");
                    }}
                    disabled={isSubmitting || !tagInput.trim()}
                  >
                    +
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 pr-1 text-xs"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive transition-colors"
                          aria-label={`Hapus tag ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* 10. Slug */}
              <div className="grid gap-2">
                <Label htmlFor="promo-slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">
                    /promo/
                  </span>
                  <Input
                    id="promo-slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      if (errors.slug)
                        setErrors((prev) => ({ ...prev, slug: "" }));
                    }}
                    placeholder="promo-akhir-tahun"
                    disabled={isSubmitting}
                    className="flex-1"
                    data-ocid="promo.slug_input"
                    aria-invalid={!!errors.slug}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSlug(generateSlug(title))}
                    disabled={isSubmitting || !title.trim()}
                    data-ocid="promo.generate_slug_button"
                  >
                    Generate dari Judul
                  </Button>
                </div>
                {errors.slug && (
                  <p
                    className="text-xs text-destructive"
                    data-ocid="promo.slug.field_error"
                  >
                    {errors.slug}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  URL publik: /promo/{slug || "..."}
                </p>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            data-ocid="promo.cancel_button"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="promo-form"
            disabled={isSubmitting || !isBootstrapped}
            className={!isBootstrapped ? "opacity-50 cursor-not-allowed" : ""}
            data-ocid="promo.submit_button"
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEdit
                ? "Perbarui Promo"
                : "Simpan Promo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
