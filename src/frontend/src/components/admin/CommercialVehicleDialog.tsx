import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddCommercialVehicle,
  useUpdateCommercialVehicle,
} from "@/hooks/useCommercialVehicles";
import { useGetAllMediaAssets } from "@/hooks/useMediaAssets";
import { Check, FileText, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { CommercialVehicle } from "../../types/local";

const BRAND_RED = "#CC0000";
const BRAND_ORANGE = "#FE5E00";

// ── Slug generator ────────────────────────────────────────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Sub-category map ──────────────────────────────────────────────────────────
const SUB_CATEGORY_MAP: Record<string, string[]> = {
  "light-duty": ["Economical", "Power", "Speed", "Capacity", "Bus"],
  "medium-duty": ["4×2", "6×2", "6×4"],
  "tractor-head": ["4×2", "6×4"],
};

// ── UID factory ───────────────────────────────────────────────────────────────
let _uid = 0;
const uid = () => {
  _uid += 1;
  return _uid;
};

interface SpecItemForm {
  _id: number;
  key: string;
  value: string;
}

interface MainImageForm {
  _id: number;
  url: string;
}

// ── Image Picker Grid ─────────────────────────────────────────────────────────
function ImagePickerGrid({
  assets,
  selectedUrl,
  onSelect,
  label,
  description,
}: {
  assets: { id: bigint; storageUrl: string; filename: string }[];
  selectedUrl: string;
  onSelect: (url: string) => void;
  label?: string;
  description?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 h-9"
        onClick={() => setOpen((v) => !v)}
        data-ocid="image-picker-toggle"
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
            className="w-20 h-20 object-cover rounded border"
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
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: `${BRAND_RED}33` }}
                      >
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

// ── PDF Picker ────────────────────────────────────────────────────────────────
function PdfPicker({
  assets,
  selectedUrl,
  onSelect,
}: {
  assets: { id: bigint; storageUrl: string; filename: string }[];
  selectedUrl: string;
  onSelect: (url: string) => void;
}) {
  const selected = assets.find((a) => a.storageUrl === selectedUrl);
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">URL Brosur (PDF)</Label>
      {assets.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Belum ada PDF di Media Manager.
        </p>
      ) : (
        <div className="space-y-1 max-h-36 overflow-y-auto border rounded-md p-2 bg-card">
          {assets.map((asset) => {
            const isSelected = selectedUrl === asset.storageUrl;
            return (
              <button
                key={asset.id.toString()}
                type="button"
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded text-xs transition-colors hover:bg-muted"
                style={{
                  background: isSelected ? `${BRAND_RED}15` : undefined,
                  border: isSelected
                    ? `1px solid ${BRAND_RED}`
                    : "1px solid transparent",
                }}
                onClick={() => onSelect(isSelected ? "" : asset.storageUrl)}
                data-ocid="pdf-picker-item"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate flex-1">{asset.filename}</span>
                {isSelected && (
                  <Check
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: BRAND_RED }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
      {selected && (
        <p className="text-xs text-muted-foreground truncate">
          Dipilih: <span className="font-medium">{selected.filename}</span>
        </p>
      )}
    </div>
  );
}

// ── Section header helper ─────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </h3>
  );
}

// ── Native select style helper ────────────────────────────────────────────────
const selectCls =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

// ── Props ─────────────────────────────────────────────────────────────────────
interface CommercialVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  vehicle?: CommercialVehicle;
  onSuccess?: () => void;
}

// ── Main Dialog ───────────────────────────────────────────────────────────────
export default function CommercialVehicleDialog({
  open,
  onClose,
  vehicle,
  onSuccess,
}: CommercialVehicleDialogProps) {
  const { data: allAssets = [] } = useGetAllMediaAssets();
  const addVehicle = useAddCommercialVehicle();
  const updateVehicle = useUpdateCommercialVehicle();

  const imageAssets = allAssets.filter((a) => a.mimeType.startsWith("image/"));
  const pdfAssets = allAssets.filter((a) => a.mimeType === "application/pdf");

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [chassisPrice, setChassisPrice] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtext, setHeroSubtext] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [description, setDescription] = useState("");
  const [mainImages, setMainImages] = useState<MainImageForm[]>([]);
  const [chassisImage, setChassisImage] = useState("");
  const [cabinImage, setCabinImage] = useState("");
  const [brochureUrl, setBrochureUrl] = useState("");
  const [footnote, setFootnote] = useState("");
  const [specifications, setSpecifications] = useState<SpecItemForm[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Picker open states for each main image slot
  const prevAutoSlug = useRef("");

  // ── Auto-slug from name ───────────────────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    const generated = toSlug(name);
    if (slug === "" || slug === prevAutoSlug.current) {
      setSlug(generated);
      prevAutoSlug.current = generated;
    }
  }, [name]);

  // ── Populate form from vehicle prop ──────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (!open) return;
    if (vehicle) {
      setName(vehicle.name ?? "");
      setSlug(vehicle.slug ?? "");
      prevAutoSlug.current = vehicle.slug ?? "";
      setCategory(vehicle.category ?? "");
      setSubCategory(vehicle.subCategory ?? "");
      setChassisPrice(
        vehicle.chassisPrice ? String(Number(vehicle.chassisPrice)) : "",
      );
      setHeroTitle(vehicle.heroTitle ?? "");
      setHeroSubtext(vehicle.heroSubtext ?? "");
      setHeroImage(vehicle.heroImage ?? "");
      setDescription(vehicle.description ?? "");
      setMainImages(
        (vehicle.mainImages ?? []).map((url) => ({ _id: uid(), url })),
      );
      setChassisImage(vehicle.chassisImage ?? "");
      setCabinImage(vehicle.cabinImage ?? "");
      setBrochureUrl(vehicle.brochureUrl ?? "");
      setFootnote(vehicle.footnote ?? "");
      setSpecifications(
        (vehicle.specifications ?? []).map((s) => ({
          _id: uid(),
          key: s.key,
          value: s.value,
        })),
      );
      setIsPublished(vehicle.isPublished ?? false);
    } else {
      setName("");
      setSlug("");
      prevAutoSlug.current = "";
      setCategory("");
      setSubCategory("");
      setChassisPrice("");
      setHeroTitle("");
      setHeroSubtext("");
      setHeroImage("");
      setDescription("");
      setMainImages([]);
      setChassisImage("");
      setCabinImage("");
      setBrochureUrl("");
      setFootnote("");
      setSpecifications([]);
      setIsPublished(false);
    }
    setErrorMsg("");
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Category change — reset subCategory ──────────────────────────────────
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSubCategory("");
  };

  // ── Specification helpers ─────────────────────────────────────────────────
  const addSpec = () =>
    setSpecifications([...specifications, { _id: uid(), key: "", value: "" }]);

  const removeSpec = (id: number) =>
    setSpecifications(specifications.filter((s) => s._id !== id));

  const updateSpec = (id: number, patch: Partial<SpecItemForm>) =>
    setSpecifications(
      specifications.map((s) => (s._id === id ? { ...s, ...patch } : s)),
    );

  // ── Main image helpers ────────────────────────────────────────────────────
  const addMainImage = () =>
    setMainImages([...mainImages, { _id: uid(), url: "" }]);

  const removeMainImage = (id: number) =>
    setMainImages(mainImages.filter((img) => img._id !== id));

  const updateMainImage = (id: number, url: string) =>
    setMainImages(
      mainImages.map((img) => (img._id === id ? { ...img, url } : img)),
    );

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Nama model wajib diisi.");
      return;
    }
    if (!category) {
      setErrorMsg("Kategori wajib dipilih.");
      return;
    }
    if (!subCategory) {
      setErrorMsg("Sub kategori wajib dipilih.");
      return;
    }

    setIsSubmitting(true);

    const input = {
      name: name.trim(),
      slug: slug.trim() || toSlug(name),
      category,
      subCategory,
      description,
      chassisPrice: Number(chassisPrice) || 0,
      heroImage,
      heroTitle,
      heroSubtext,
      mainImages: mainImages
        .map((img) => img.url)
        .filter((u) => u.trim() !== ""),
      chassisImage,
      cabinImage,
      brochureUrl,
      footnote,
      specifications: specifications
        .filter((s) => s.key.trim() !== "")
        .map((s) => ({ key: s.key, value: s.value })),
      isPublished,
    };

    try {
      if (vehicle) {
        await updateVehicle.mutateAsync({ id: vehicle.id, ...input });
        toast.success("Kendaraan niaga berhasil diperbarui");
      } else {
        await addVehicle.mutateAsync(input);
        toast.success("Kendaraan niaga berhasil ditambahkan");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan tidak diketahui";
      setErrorMsg(`Gagal menyimpan: ${msg}`);
      toast.error("Gagal menyimpan kendaraan niaga");
      console.error("CommercialVehicle save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subCategoryOptions = category ? (SUB_CATEGORY_MAP[category] ?? []) : [];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[900px] w-full flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>
            {vehicle ? "Edit Kendaraan Niaga" : "Tambah Kendaraan Niaga Baru"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 px-6 max-h-[80vh] overflow-y-auto">
          <form id="commercial-vehicle-form" onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* ── Informasi Dasar ──────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <SectionTitle>Informasi Dasar</SectionTitle>

                {/* Nama Model */}
                <div className="grid gap-2">
                  <Label htmlFor="cv-name">
                    Nama Model <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cv-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder="Contoh: Canter FE 71"
                    data-ocid="cv.input.name"
                  />
                </div>

                {/* Slug */}
                <div className="grid gap-2">
                  <Label htmlFor="cv-slug">Slug URL</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">
                      /mobil-niaga/{category || "kategori"}/
                    </span>
                    <Input
                      id="cv-slug"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        prevAutoSlug.current = "";
                      }}
                      disabled={isSubmitting}
                      placeholder="canter-fe-71"
                      className="flex-1"
                      data-ocid="cv.input.slug"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Akan di-generate otomatis dari nama jika dikosongkan.
                  </p>
                </div>

                {/* Kategori */}
                <div className="grid gap-2">
                  <Label htmlFor="cv-category">
                    Kategori <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="cv-category"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className={selectCls}
                    data-ocid="cv.select.category"
                  >
                    <option value="">— Pilih Kategori —</option>
                    <option value="light-duty">Light Duty</option>
                    <option value="medium-duty">Medium Duty</option>
                    <option value="tractor-head">Tractor Head</option>
                  </select>
                </div>

                {/* Sub Kategori */}
                <div className="grid gap-2">
                  <Label htmlFor="cv-subcategory">
                    Sub Kategori <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="cv-subcategory"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    required
                    disabled={isSubmitting || !category}
                    className={selectCls}
                    data-ocid="cv.select.subcategory"
                  >
                    <option value="">
                      {category
                        ? "— Pilih Sub Kategori —"
                        : "— Pilih kategori dulu —"}
                    </option>
                    {subCategoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Harga Chassis */}
                <div className="grid gap-2">
                  <Label htmlFor="cv-price">Harga Chassis (Rp)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      Rp
                    </span>
                    <Input
                      id="cv-price"
                      type="number"
                      min="0"
                      value={chassisPrice}
                      onChange={(e) => setChassisPrice(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="0"
                      className="pl-9"
                      data-ocid="cv.input.chassis-price"
                    />
                  </div>
                </div>
              </section>

              {/* ── Hero Section ─────────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <SectionTitle>Hero Section</SectionTitle>

                <div className="grid gap-2">
                  <Label htmlFor="cv-hero-title">Hero Title</Label>
                  <Input
                    id="cv-hero-title"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Judul hero yang tampil di halaman detail"
                    data-ocid="cv.input.hero-title"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cv-hero-subtext">Hero Subtext</Label>
                  <Input
                    id="cv-hero-subtext"
                    value={heroSubtext}
                    onChange={(e) => setHeroSubtext(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Subtext hero"
                    data-ocid="cv.input.hero-subtext"
                  />
                </div>

                <ImagePickerGrid
                  assets={imageAssets}
                  selectedUrl={heroImage}
                  onSelect={setHeroImage}
                  label="Hero Image"
                  description="Gambar banner full-width di bagian atas halaman detail"
                />
              </section>

              {/* ── Konten ───────────────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <SectionTitle>Konten Produk</SectionTitle>

                <div className="grid gap-2">
                  <Label htmlFor="cv-description">Deskripsi Produk</Label>
                  <Textarea
                    id="cv-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                    placeholder="Deskripsi kendaraan niaga..."
                    data-ocid="cv.textarea.description"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cv-footnote">Footnote</Label>
                  <Textarea
                    id="cv-footnote"
                    value={footnote}
                    onChange={(e) => setFootnote(e.target.value)}
                    rows={2}
                    disabled={isSubmitting}
                    placeholder="Catatan tambahan yang tampil di bawah halaman detail..."
                    data-ocid="cv.textarea.footnote"
                  />
                </div>
              </section>

              {/* ── Media / Gambar ────────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <SectionTitle>Galeri Gambar</SectionTitle>

                {/* Gambar Utama / Slideshow */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        Gambar Utama / Slideshow ({mainImages.length})
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Gambar yang tampil di slideshow halaman detail. Bisa
                        tambah tak terbatas.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addMainImage}
                      disabled={isSubmitting}
                      data-ocid="cv.btn.add-main-image"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Tambah Gambar
                    </Button>
                  </div>

                  {mainImages.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      Belum ada gambar slideshow. Klik "Tambah Gambar" untuk
                      menambahkan.
                    </p>
                  )}

                  {mainImages.map((img, idx) => (
                    <div
                      key={img._id}
                      className="border rounded-md p-3 bg-background space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">
                          Gambar #{idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => removeMainImage(img._id)}
                          disabled={isSubmitting}
                          data-ocid={`cv.btn.remove-main-image.${idx + 1}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <ImagePickerGrid
                        assets={imageAssets}
                        selectedUrl={img.url}
                        onSelect={(url) => updateMainImage(img._id, url)}
                        label="Pilih gambar"
                      />
                    </div>
                  ))}
                </div>

                {/* Gambar Chassis */}
                <ImagePickerGrid
                  assets={imageAssets}
                  selectedUrl={chassisImage}
                  onSelect={setChassisImage}
                  label="Gambar Chassis"
                  description="Gambar tampak chassis kendaraan"
                />

                {/* Gambar Kabin (opsional) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        Gambar Kabin{" "}
                        <span className="text-muted-foreground font-normal">
                          (opsional)
                        </span>
                      </Label>
                    </div>
                    {cabinImage && (
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline"
                        onClick={() => setCabinImage("")}
                        disabled={isSubmitting}
                        data-ocid="cv.btn.clear-cabin-image"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <ImagePickerGrid
                    assets={imageAssets}
                    selectedUrl={cabinImage}
                    onSelect={setCabinImage}
                    description="Jika diisi, akan tampil berdampingan dengan gambar chassis"
                  />
                </div>

                {/* Brosur PDF */}
                <PdfPicker
                  assets={pdfAssets}
                  selectedUrl={brochureUrl}
                  onSelect={setBrochureUrl}
                />
              </section>

              {/* ── Tabel Spesifikasi ─────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <SectionTitle>
                    Spesifikasi ({specifications.length})
                  </SectionTitle>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addSpec}
                    disabled={isSubmitting}
                    data-ocid="cv.btn.add-spec"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Tambah Spesifikasi
                  </Button>
                </div>

                {specifications.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Belum ada spesifikasi. Klik "Tambah Spesifikasi" untuk
                    menambahkan baris.
                  </p>
                )}

                {specifications.length > 0 && (
                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Nama Spesifikasi
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        Nilai
                      </span>
                      <span className="w-8" />
                    </div>

                    {specifications.map((spec, idx) => (
                      <div
                        key={spec._id}
                        className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
                        data-ocid={`cv.spec.row.${idx + 1}`}
                      >
                        <Input
                          value={spec.key}
                          onChange={(e) =>
                            updateSpec(spec._id, { key: e.target.value })
                          }
                          placeholder="Contoh: Mesin"
                          className="h-8 text-sm"
                          disabled={isSubmitting}
                          data-ocid={`cv.spec.key.${idx + 1}`}
                        />
                        <Input
                          value={spec.value}
                          onChange={(e) =>
                            updateSpec(spec._id, { value: e.target.value })
                          }
                          placeholder="Contoh: 4D34-3AT4"
                          className="h-8 text-sm"
                          disabled={isSubmitting}
                          data-ocid={`cv.spec.value.${idx + 1}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
                          onClick={() => removeSpec(spec._id)}
                          disabled={isSubmitting}
                          data-ocid={`cv.btn.remove-spec.${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Status Publikasi ──────────────────────────────────────── */}
              <section>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="text-sm font-medium">Status Publikasi</p>
                    <p className="text-xs text-muted-foreground">
                      {isPublished
                        ? "Kendaraan ini terlihat di halaman publik"
                        : "Kendaraan ini masih tersembunyi (draft)"}
                    </p>
                  </div>
                  <Switch
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                    disabled={isSubmitting}
                    data-ocid="cv.toggle.published"
                  />
                </div>
              </section>

              {/* ── Error message ─────────────────────────────────────────── */}
              {errorMsg && (
                <div
                  className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  data-ocid="cv.error-message"
                >
                  {errorMsg}
                </div>
              )}
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-card">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            data-ocid="cv.btn.cancel"
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="commercial-vehicle-form"
            disabled={isSubmitting || !name.trim()}
            style={{
              backgroundColor: isSubmitting ? undefined : BRAND_ORANGE,
              color: "white",
            }}
            data-ocid="cv.btn.submit"
          >
            {isSubmitting
              ? "Menyimpan..."
              : vehicle
                ? "Perbarui Kendaraan"
                : "Simpan Kendaraan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
