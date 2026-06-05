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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useGetAllMediaAssets } from "@/hooks/useMediaAssets";
import { useAddVehicle, useUpdateVehicle } from "@/hooks/useVehicles";
import { Check, FileText, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PassengerVehicle, SpecTab } from "../../types/local";
import BannerImagePicker from "./BannerImagePicker";

const RED = "#CC0000";

interface PassengerVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: PassengerVehicle | null;
}

// ── UID factory ───────────────────────────────────────────────────────────────
let _uid = 0;
const uid = () => {
  _uid += 1;
  return _uid;
};

// ── Local form types ──────────────────────────────────────────────────────────
interface ColorForm {
  _id: number;
  colorName: string;
  colorImage: string;
  vehicleImage: string;
  price: string;
}

interface VariantForm {
  _id: number;
  variantName: string;
  hasPremiumOption: boolean;
  thumbnailUrl: string;
  price: string;
  colors: ColorForm[];
}

interface FootnoteForm {
  _id: number;
  value: string;
}

interface SpecCellForm {
  _id: number;
  value: string;
  colSpan: number;
}

interface SpecRowForm {
  _id: number;
  cells: SpecCellForm[];
}

interface SpecTabForm {
  _id: number;
  title: string;
  columns: string[];
  rows: SpecRowForm[];
}

interface AftersaleImageForm {
  _id: number;
  url: string;
}

// ── Slug generator ────────────────────────────────────────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
                        style={{ background: `${RED}33` }}
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
      <Label className="text-sm font-medium">Brosur PDF</Label>
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
                  background: isSelected ? `${RED}15` : undefined,
                  border: isSelected
                    ? `1px solid ${RED}`
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
                    style={{ color: RED }}
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

// ── Main Dialog ───────────────────────────────────────────────────────────────
export default function PassengerVehicleDialog({
  open,
  onOpenChange,
  vehicle,
}: PassengerVehicleDialogProps) {
  const { data: allAssets = [] } = useGetAllMediaAssets();
  const addVehicle = useAddVehicle();
  const updateVehicle = useUpdateVehicle();

  const imageAssets = allAssets.filter((a) => a.mimeType.startsWith("image/"));
  const pdfAssets = allAssets.filter((a) => a.mimeType === "application/pdf");

  // ── Form state ────────────────────────────────────────────────────────────
  const [vehicleName, setVehicleName] = useState("");
  const [titleImageUrl, setTitleImageUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroBannerVideoId, setHeroBannerVideoId] = useState<
    bigint | undefined
  >(undefined);
  const [heroBannerVideoPickerOpen, setHeroBannerVideoPickerOpen] =
    useState(false);
  const [brochureUrl, setBrochureUrl] = useState("");
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [specTabs, setSpecTabs] = useState<SpecTabForm[]>([]);
  const [footnotes, setFootnotes] = useState<FootnoteForm[]>([]);
  const [aftersaleImages, setAftersaleImages] = useState<AftersaleImageForm[]>(
    [],
  );
  const [ctaText, setCtaText] = useState("");
  const [ctaSubtext, setCtaSubtext] = useState("");
  const [ctaButtonLabel, setCtaButtonLabel] = useState("");
  const [ctaButtonUrl, setCtaButtonUrl] = useState("");
  const [vehicleType, setVehicleType] = useState<string>("passenger");
  const [publishStatus, setPublishStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prevAutoSlug = useRef("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    const generated = toSlug(vehicleName);
    if (slug === "" || slug === prevAutoSlug.current) {
      setSlug(generated);
      prevAutoSlug.current = generated;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleName]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (!open) return;
    if (vehicle) {
      setVehicleName(vehicle.vehicleName ?? "");
      setTitleImageUrl(vehicle.titleImageUrl ?? "");
      setSlug(vehicle.slug ?? "");
      prevAutoSlug.current = vehicle.slug ?? "";
      setDescription(vehicle.description ?? "");
      setHeroImageUrl(vehicle.heroImageUrl ?? "");
      setHeroBannerVideoId(
        vehicle.heroBannerVideoId
          ? BigInt(vehicle.heroBannerVideoId)
          : undefined,
      );
      setBrochureUrl(vehicle.brochureUrl ?? "");
      setVariants(
        (vehicle.variants ?? []).map((v) => ({
          _id: uid(),
          variantName: v.variantName,
          hasPremiumOption: v.hasPremiumOption,
          thumbnailUrl: v.thumbnailUrl ?? "",
          price: v.price ? v.price.toString() : "",
          colors: (v.colors ?? []).map((c) => ({
            _id: uid(),
            colorName: c.colorName,
            colorImage: c.colorImage ?? "",
            vehicleImage: c.vehicleImage ?? "",
            price: c.price ? c.price.toString() : "",
          })),
        })),
      );
      setSpecTabs(
        (vehicle.specTabs ?? []).map((t) => ({
          _id: uid(),
          title: t.title,
          columns: t.columns || [],
          rows: (t.rows ?? []).map((r) => ({
            _id: uid(),
            cells: (r.cells ?? []).map((c) => ({
              _id: uid(),
              value: c.value || "",
              colSpan: c.colSpan || 1,
            })),
          })),
        })),
      );
      setFootnotes(
        (vehicle.footnotes ?? []).map((f) => ({ _id: uid(), value: f })),
      );
      setAftersaleImages(
        (vehicle.aftersaleImages ?? []).map((url) => ({ _id: uid(), url })),
      );
      setCtaText(vehicle.ctaText ?? "");
      setCtaSubtext(vehicle.ctaSubtext ?? "");
      setCtaButtonLabel(vehicle.ctaButtonLabel ?? "");
      setCtaButtonUrl(vehicle.ctaButtonUrl ?? "");
      setVehicleType(vehicle.vehicleType ?? "passenger");
      setPublishStatus(vehicle.publishStatus ?? false);
    } else {
      setVehicleName("");
      setTitleImageUrl("");
      setSlug("");
      prevAutoSlug.current = "";
      setDescription("");
      setHeroImageUrl("");
      setHeroBannerVideoId(undefined);
      setBrochureUrl("");
      setVariants([]);
      setSpecTabs([]);
      setFootnotes([]);
      setAftersaleImages([]);
      setCtaText("");
      setCtaSubtext("");
      setCtaButtonLabel("");
      setCtaButtonUrl("");
      setVehicleType("passenger");
      setPublishStatus(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Variant helpers ───────────────────────────────────────────────────────
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        _id: uid(),
        variantName: "",
        hasPremiumOption: false,
        thumbnailUrl: "",
        price: "",
        colors: [],
      },
    ]);
  };

  const removeVariant = (id: number) =>
    setVariants(variants.filter((v) => v._id !== id));

  const updateVariant = (id: number, patch: Partial<VariantForm>) =>
    setVariants(variants.map((v) => (v._id === id ? { ...v, ...patch } : v)));

  const addColor = (variantId: number) => {
    const v = variants.find((v) => v._id === variantId);
    if (!v) return;
    updateVariant(variantId, {
      colors: [
        ...v.colors,
        {
          _id: uid(),
          colorName: "",
          colorImage: "",
          vehicleImage: "",
          price: "",
        },
      ],
    });
  };

  const removeColor = (variantId: number, colorId: number) => {
    const v = variants.find((v) => v._id === variantId);
    if (!v) return;
    updateVariant(variantId, {
      colors: v.colors.filter((c) => c._id !== colorId),
    });
  };

  const updateColor = (
    variantId: number,
    colorId: number,
    patch: Partial<ColorForm>,
  ) => {
    const v = variants.find((v) => v._id === variantId);
    if (!v) return;
    updateVariant(variantId, {
      colors: v.colors.map((c) => (c._id === colorId ? { ...c, ...patch } : c)),
    });
  };

  // ── SpecTab helpers ───────────────────────────────────────────────────────
  const addSpecTab = () => {
    setSpecTabs([
      ...specTabs,
      { _id: uid(), title: "", columns: [], rows: [] },
    ]);
  };

  const removeSpecTab = (tabId: number) =>
    setSpecTabs(specTabs.filter((t) => t._id !== tabId));

  const updateSpecTab = (tabId: number, patch: Partial<SpecTabForm>) =>
    setSpecTabs(
      specTabs.map((t) => (t._id === tabId ? { ...t, ...patch } : t)),
    );

  const addSpecColumn = (tabId: number) => {
    const tab = specTabs.find((t) => t._id === tabId);
    if (!tab) return;
    updateSpecTab(tabId, {
      columns: [...tab.columns, ""],
      rows: tab.rows.map((r) => ({
        ...r,
        cells: [...r.cells, { _id: uid(), value: "", colSpan: 1 }],
      })),
    });
  };

  const removeSpecColumn = (tabId: number, colIdx: number) => {
    const tab = specTabs.find((t) => t._id === tabId);
    if (!tab) return;
    updateSpecTab(tabId, {
      columns: tab.columns.filter((_, i) => i !== colIdx),
      rows: tab.rows.map((r) => ({
        ...r,
        cells: r.cells.filter((_, i) => i !== colIdx),
      })),
    });
  };

  const updateSpecColumnName = (
    tabId: number,
    colIdx: number,
    value: string,
  ) => {
    const tab = specTabs.find((t) => t._id === tabId);
    if (!tab) return;
    updateSpecTab(tabId, {
      columns: tab.columns.map((c, i) => (i === colIdx ? value : c)),
    });
  };

  const addSpecRow = (tabId: number) => {
    const tab = specTabs.find((t) => t._id === tabId);
    if (!tab) return;
    const cells: SpecCellForm[] = tab.columns.map(() => ({
      _id: uid(),
      value: "",
      colSpan: 1,
    }));
    updateSpecTab(tabId, {
      rows: [...tab.rows, { _id: uid(), cells }],
    });
  };

  const removeSpecRow = (tabId: number, rowId: number) => {
    const tab = specTabs.find((t) => t._id === tabId);
    if (!tab) return;
    updateSpecTab(tabId, { rows: tab.rows.filter((r) => r._id !== rowId) });
  };

  const updateSpecCell = (
    tabId: number,
    rowId: number,
    cellId: number,
    patch: Partial<SpecCellForm>,
  ) => {
    const tab = specTabs.find((t) => t._id === tabId);
    if (!tab) return;
    updateSpecTab(tabId, {
      rows: tab.rows.map((r) =>
        r._id === rowId
          ? {
              ...r,
              cells: r.cells.map((c) =>
                c._id === cellId ? { ...c, ...patch } : c,
              ),
            }
          : r,
      ),
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const variantPayload = variants.map((v) => ({
      variantName: v.variantName,
      hasPremiumOption: v.hasPremiumOption,
      thumbnailUrl: v.thumbnailUrl,
      price: BigInt(v.price || 0),
      colors: v.colors.map((c) => ({
        colorName: c.colorName,
        colorImage: c.colorImage,
        vehicleImage: c.vehicleImage,
        price: BigInt(c.price || 0),
      })),
    }));

    const specTabsPayload: SpecTab[] = specTabs.map((t) => ({
      title: t.title,
      columns: t.columns,
      rows: t.rows.map((r) => ({
        cells: r.cells.map((c) => ({ value: c.value, colSpan: c.colSpan })),
      })),
    }));

    const footnotesPayload = footnotes
      .map((f) => f.value)
      .filter((v) => v.trim() !== "");

    const aftersaleImagesPayload = aftersaleImages
      .map((i) => i.url)
      .filter((v) => v.trim() !== "");

    const input = {
      vehicleName,
      description,
      slug,
      heroImageUrl,
      brochureUrl,
      variants: variantPayload,
      specTabs: specTabsPayload,
      footnotes: footnotesPayload,
      aftersaleImages: aftersaleImagesPayload,
      ctaText,
      ctaSubtext,
      ctaButtonLabel,
      ctaButtonUrl,
      vehicleType,
      publishStatus,
      titleImageUrl: titleImageUrl || null,
      heroBannerVideoId: heroBannerVideoId?.toString() || null,
    };

    try {
      if (vehicle) {
        await updateVehicle.mutateAsync({ id: vehicle.id, ...input });
        toast.success("Kendaraan berhasil diperbarui");
      } else {
        await addVehicle.mutateAsync(input);
        toast.success("Kendaraan berhasil ditambahkan");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error("Gagal menyimpan kendaraan");
      console.error(
        "[PassengerVehicle] Full error:",
        JSON.stringify(err, null, 2),
      );
      console.error("[PassengerVehicle] Message:", (err as Error)?.message);
      console.error("[PassengerVehicle] Stack:", (err as Error)?.stack);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px] w-full flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>
            {vehicle ? "Edit Kendaraan" : "Tambah Kendaraan Baru"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 px-6 max-h-[80vh] overflow-y-auto">
          <form id="vehicle-form" onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* ── Informasi Dasar ───────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <SectionTitle>Informasi Dasar</SectionTitle>

                <div className="grid gap-2">
                  <Label htmlFor="vehicleName">Nama Kendaraan *</Label>
                  <Input
                    id="vehicleName"
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    data-ocid="input-vehicle-name"
                    placeholder="Contoh: Mitsubishi Xpander"
                  />
                </div>

                {/* ── Gambar Judul (opsional) ───────────────────── */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Gambar Judul{" "}
                      <span className="text-muted-foreground font-normal">
                        (opsional)
                      </span>
                    </Label>
                    {titleImageUrl && (
                      <button
                        type="button"
                        className="text-xs text-destructive hover:underline"
                        onClick={() => setTitleImageUrl("")}
                        disabled={isSubmitting}
                        data-ocid="btn-clear-title-image"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Jika diisi, gambar ini akan menggantikan teks judul di
                    halaman detail publik.
                  </p>
                  <ImagePickerGrid
                    assets={imageAssets}
                    selectedUrl={titleImageUrl}
                    onSelect={setTitleImageUrl}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug URL</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">
                      /mobil-keluarga/
                    </span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        prevAutoSlug.current = "";
                      }}
                      disabled={isSubmitting}
                      data-ocid="input-vehicle-slug"
                      placeholder="xpander"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="vehicleType">
                    Tipe Kendaraan <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="vehicleType"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    required
                    disabled={isSubmitting}
                    data-ocid="select-vehicle-type"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="passenger">
                      Passenger (Mobil Keluarga)
                    </option>
                    <option value="commercial">Commercial (Mobil Niaga)</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    disabled={isSubmitting}
                    placeholder="Deskripsi singkat kendaraan..."
                  />
                </div>
              </section>

              {/* ── Media ─────────────────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <SectionTitle>Media</SectionTitle>
                <ImagePickerGrid
                  assets={imageAssets}
                  selectedUrl={heroImageUrl}
                  onSelect={setHeroImageUrl}
                  label="Hero Image"
                />
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">
                    Video Banner Hero (opsional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 justify-start gap-2 h-9"
                      onClick={() => setHeroBannerVideoPickerOpen(true)}
                      disabled={isSubmitting}
                      data-ocid="btn-pick-hero-video"
                    >
                      <svg
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect
                          x="1"
                          y="5"
                          width="15"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                      </svg>
                      <span className="truncate text-xs">
                        {heroBannerVideoId
                          ? `ID: ${heroBannerVideoId.toString()}`
                          : "Pilih Video Banner Hero"}
                      </span>
                    </Button>
                    {heroBannerVideoId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                        onClick={() => setHeroBannerVideoId(undefined)}
                        disabled={isSubmitting}
                        aria-label="Hapus video"
                        data-ocid="btn-clear-hero-video"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                  <BannerImagePicker
                    open={heroBannerVideoPickerOpen}
                    onOpenChange={setHeroBannerVideoPickerOpen}
                    onSelect={(id) => setHeroBannerVideoId(id)}
                    value={heroBannerVideoId}
                    mediaType="video"
                  />
                </div>
                <PdfPicker
                  assets={pdfAssets}
                  selectedUrl={brochureUrl}
                  onSelect={setBrochureUrl}
                />
              </section>

              {/* ── Varian ────────────────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <SectionTitle>Varian ({variants.length})</SectionTitle>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addVariant}
                    disabled={isSubmitting}
                    data-ocid="btn-add-variant"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Tambah Varian
                  </Button>
                </div>

                {variants.map((variant, vIdx) => (
                  <div
                    key={variant._id}
                    className="border rounded-lg p-4 space-y-4 bg-background"
                  >
                    {/* Variant header */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground w-5 shrink-0">
                        #{vIdx + 1}
                      </span>
                      <div className="flex-1 grid gap-1">
                        <Label className="text-xs">Nama Varian</Label>
                        <Input
                          value={variant.variantName}
                          onChange={(e) =>
                            updateVariant(variant._id, {
                              variantName: e.target.value,
                            })
                          }
                          placeholder="Contoh: Ultimate"
                          disabled={isSubmitting}
                          className="h-8 text-sm"
                          data-ocid={`input-variant-name-${variant._id}`}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <Checkbox
                          id={`premium-${variant._id}`}
                          checked={variant.hasPremiumOption}
                          onCheckedChange={(v) =>
                            updateVariant(variant._id, {
                              hasPremiumOption: !!v,
                            })
                          }
                          disabled={isSubmitting}
                          data-ocid={`chk-premium-${variant._id}`}
                        />
                        <Label
                          htmlFor={`premium-${variant._id}`}
                          className="text-xs whitespace-nowrap cursor-pointer"
                        >
                          Opsi Premium
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive mt-4 shrink-0"
                        onClick={() => removeVariant(variant._id)}
                        disabled={isSubmitting}
                        data-ocid={`btn-remove-variant-${variant._id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Variant thumbnail */}
                    <ImagePickerGrid
                      assets={imageAssets}
                      selectedUrl={variant.thumbnailUrl}
                      onSelect={(url) =>
                        updateVariant(variant._id, { thumbnailUrl: url })
                      }
                      label="Thumbnail Varian"
                    />

                    {/* Variant price */}
                    <div className="grid gap-1">
                      <Label className="text-xs">Harga Varian (IDR)</Label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          Rp
                        </span>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(variant._id, {
                              price: e.target.value,
                            })
                          }
                          placeholder="350000000"
                          disabled={isSubmitting}
                          className="h-8 text-sm pl-8"
                          min="0"
                          data-ocid={`input-variant-price-${variant._id}`}
                        />
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Warna ({variant.colors.length})
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs px-2"
                          onClick={() => addColor(variant._id)}
                          disabled={isSubmitting}
                          data-ocid={`btn-add-color-${variant._id}`}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Tambah Warna
                        </Button>
                      </div>

                      {variant.colors.map((color, cIdx) => (
                        <div
                          key={color._id}
                          className="border rounded-md p-3 space-y-3 bg-muted/20"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">
                              Warna #{cIdx + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() =>
                                removeColor(variant._id, color._id)
                              }
                              disabled={isSubmitting}
                              data-ocid={`btn-remove-color-${variant._id}-${color._id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Nama Warna</Label>
                              <Input
                                value={color.colorName}
                                onChange={(e) =>
                                  updateColor(variant._id, color._id, {
                                    colorName: e.target.value,
                                  })
                                }
                                placeholder="Merah"
                                className="h-8 text-xs"
                                disabled={isSubmitting}
                                data-ocid={`input-color-name-${variant._id}-${color._id}`}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Harga (IDR)</Label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                  Rp
                                </span>
                                <Input
                                  type="number"
                                  value={color.price}
                                  onChange={(e) =>
                                    updateColor(variant._id, color._id, {
                                      price: e.target.value,
                                    })
                                  }
                                  placeholder="350000000"
                                  className="h-8 text-xs pl-8"
                                  disabled={isSubmitting}
                                  min="0"
                                  data-ocid={`input-color-price-${variant._id}-${color._id}`}
                                />
                              </div>
                            </div>
                          </div>

                          <ImagePickerGrid
                            assets={imageAssets}
                            selectedUrl={color.colorImage}
                            onSelect={(url) =>
                              updateColor(variant._id, color._id, {
                                colorImage: url,
                              })
                            }
                            label="Gambar Warna (Swatch)"
                            description="Gambar tekstur/cat warna untuk kotak swatch"
                          />

                          <ImagePickerGrid
                            assets={imageAssets}
                            selectedUrl={color.vehicleImage}
                            onSelect={(url) =>
                              updateColor(variant._id, color._id, {
                                vehicleImage: url,
                              })
                            }
                            label="Gambar Kendaraan (Warna Ini)"
                            description="Gambar kendaraan yang tampil saat warna ini dipilih"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              {/* ── Tab Spesifikasi ───────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <SectionTitle>
                    Tab Spesifikasi ({specTabs.length})
                  </SectionTitle>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addSpecTab}
                    disabled={isSubmitting}
                    data-ocid="btn-add-spec-tab"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Tambah Tab
                  </Button>
                </div>

                {specTabs.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Belum ada tab. Klik "Tambah Tab" untuk menambahkan tab
                    seperti "Dimensi", "Mesin", atau "Performa".
                  </p>
                )}

                {specTabs.map((tab, tIdx) => (
                  <div
                    key={tab._id}
                    className="border rounded-lg p-4 space-y-4 bg-background"
                  >
                    {/* Tab title + hapus */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground shrink-0">
                        Tab #{tIdx + 1}
                      </span>
                      <div className="flex-1 grid gap-1">
                        <Label className="text-xs">Judul Tab</Label>
                        <Input
                          value={tab.title}
                          onChange={(e) =>
                            updateSpecTab(tab._id, { title: e.target.value })
                          }
                          placeholder="Contoh: Dimensi"
                          disabled={isSubmitting}
                          className="h-8 text-sm"
                          data-ocid={`input-spec-tab-title-${tab._id}`}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive mt-4 shrink-0"
                        onClick={() => removeSpecTab(tab._id)}
                        disabled={isSubmitting}
                        data-ocid={`btn-remove-spec-tab-${tab._id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Columns */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Kolom ({tab.columns.length})
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs px-2"
                          onClick={() => addSpecColumn(tab._id)}
                          disabled={isSubmitting}
                          data-ocid={`btn-add-spec-col-${tab._id}`}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Tambah Kolom
                        </Button>
                      </div>
                      {tab.columns.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          Tambahkan kolom dahulu sebelum menambah baris.
                        </p>
                      )}
                      {tab.columns.map((col, cIdx) => (
                        <div
                          key={`col-${tab._id}-${cIdx}`}
                          className="flex items-center gap-2"
                        >
                          <span className="text-xs text-muted-foreground w-14 shrink-0">
                            Kolom {cIdx + 1}
                          </span>
                          <Input
                            value={col}
                            onChange={(e) =>
                              updateSpecColumnName(
                                tab._id,
                                cIdx,
                                e.target.value,
                              )
                            }
                            placeholder={`Nama kolom ${cIdx + 1}`}
                            className="h-8 text-xs flex-1"
                            disabled={isSubmitting}
                            data-ocid={`input-spec-col-${tab._id}-${cIdx}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
                            onClick={() => removeSpecColumn(tab._id, cIdx)}
                            disabled={isSubmitting}
                            data-ocid={`btn-remove-spec-col-${tab._id}-${cIdx}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 mt-1">
                        {tab.columns.length} kolom terdefinisi
                      </p>
                    </div>

                    {/* Rows */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">
                          Baris ({tab.rows.length})
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs px-2"
                          onClick={() => addSpecRow(tab._id)}
                          disabled={isSubmitting || tab.columns.length === 0}
                          data-ocid={`btn-add-spec-row-${tab._id}`}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Tambah Baris
                        </Button>
                      </div>

                      {tab.rows.length === 0 && tab.columns.length > 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          Belum ada baris. Klik "Tambah Baris".
                        </p>
                      )}

                      {tab.rows.map((row, rIdx) => (
                        <div
                          key={row._id}
                          className="border rounded-md p-2 bg-muted/20 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-medium">
                              Baris #{rIdx + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => removeSpecRow(tab._id, row._id)}
                              disabled={isSubmitting}
                              data-ocid={`btn-remove-spec-row-${tab._id}-${row._id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div
                            className="grid gap-2"
                            style={{
                              gridTemplateColumns: `repeat(${Math.max(
                                tab.columns.length,
                                1,
                              )}, 1fr)`,
                            }}
                          >
                            {row.cells.map((cell, cellIdx) => (
                              <div
                                key={cell._id}
                                className={`space-y-1 ${
                                  cellIdx < row.cells.length - 1
                                    ? "border-r border-gray-200 pr-2"
                                    : ""
                                }`}
                              >
                                {rIdx === 0 && (
                                  <Label className="text-xs text-muted-foreground">
                                    {tab.columns[cellIdx] ||
                                      `Kolom ${cellIdx + 1}`}
                                  </Label>
                                )}
                                <Input
                                  value={cell.value}
                                  onChange={(e) =>
                                    updateSpecCell(tab._id, row._id, cell._id, {
                                      value: e.target.value,
                                    })
                                  }
                                  placeholder={tab.columns[cellIdx] || "Nilai"}
                                  className="h-8 text-xs"
                                  disabled={isSubmitting}
                                  data-ocid={`input-spec-cell-${tab._id}-${row._id}-${cell._id}`}
                                />
                                {/* ColSpan input — only for cell index >= 1 (not the first/label column) */}
                                {cellIdx >= 1 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-gray-400">
                                      CS
                                    </span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={tab.columns.length - cellIdx}
                                      value={cell.colSpan ?? 1}
                                      onChange={(e) =>
                                        updateSpecCell(
                                          tab._id,
                                          row._id,
                                          cell._id,
                                          {
                                            colSpan: Math.max(
                                              1,
                                              Number(e.target.value) || 1,
                                            ),
                                          },
                                        )
                                      }
                                      className="w-12 text-xs border border-gray-200 px-1 py-0.5 ml-1"
                                      disabled={isSubmitting}
                                      data-ocid={`input-spec-colspan-${tab._id}-${row._id}-${cell._id}`}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              {/* ── Catatan Kaki ──────────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <SectionTitle>Catatan Kaki</SectionTitle>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setFootnotes([...footnotes, { _id: uid(), value: "" }])
                    }
                    disabled={isSubmitting}
                    data-ocid="btn-add-footnote"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Tambah Catatan
                  </Button>
                </div>
                <div className="space-y-2">
                  {footnotes.map((fn) => (
                    <div key={fn._id} className="flex items-center gap-2">
                      <Input
                        value={fn.value}
                        onChange={(e) =>
                          setFootnotes(
                            footnotes.map((f) =>
                              f._id === fn._id
                                ? { ...f, value: e.target.value }
                                : f,
                            ),
                          )
                        }
                        placeholder="Catatan kaki..."
                        className="h-8 text-sm"
                        disabled={isSubmitting}
                        data-ocid={`input-footnote-${fn._id}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
                        onClick={() =>
                          setFootnotes(
                            footnotes.filter((f) => f._id !== fn._id),
                          )
                        }
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {footnotes.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Belum ada catatan kaki. Klik "Tambah Catatan" untuk
                      menambahkan.
                    </p>
                  )}
                </div>
              </section>

              {/* ── Gambar Purna Jual ─────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <SectionTitle>Gambar Purna Jual</SectionTitle>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setAftersaleImages([
                        ...aftersaleImages,
                        { _id: uid(), url: "" },
                      ])
                    }
                    disabled={isSubmitting}
                    data-ocid="btn-add-aftersale"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Tambah Gambar
                  </Button>
                </div>
                <div className="space-y-3">
                  {aftersaleImages.map((img, idx) => (
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
                          onClick={() =>
                            setAftersaleImages(
                              aftersaleImages.filter((i) => i._id !== img._id),
                            )
                          }
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <ImagePickerGrid
                        assets={imageAssets}
                        selectedUrl={img.url}
                        onSelect={(url) =>
                          setAftersaleImages(
                            aftersaleImages.map((i) =>
                              i._id === img._id ? { ...i, url } : i,
                            ),
                          )
                        }
                        label="Pilih gambar"
                      />
                    </div>
                  ))}
                  {aftersaleImages.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Belum ada gambar. Tambahkan minimal 2 gambar purna jual.
                    </p>
                  )}
                </div>
              </section>

              {/* ── CTA Akhir ─────────────────────────────────────────────── */}
              <section className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <SectionTitle>CTA Akhir (Section Bawah)</SectionTitle>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label htmlFor="ctaText" className="text-xs">
                      Teks Utama CTA
                    </Label>
                    <Input
                      id="ctaText"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Temukan Mobil Keluarga Terbaik"
                      disabled={isSubmitting}
                      className="h-8 text-sm"
                      data-ocid="input-cta-text"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="ctaSubtext" className="text-xs">
                      Subteks CTA
                    </Label>
                    <Input
                      id="ctaSubtext"
                      value={ctaSubtext}
                      onChange={(e) => setCtaSubtext(e.target.value)}
                      placeholder="Bandingkan varian dan temukan yang paling sesuai"
                      disabled={isSubmitting}
                      className="h-8 text-sm"
                      data-ocid="input-cta-subtext"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="ctaButtonLabel" className="text-xs">
                      Label Tombol
                    </Label>
                    <Input
                      id="ctaButtonLabel"
                      value={ctaButtonLabel}
                      onChange={(e) => setCtaButtonLabel(e.target.value)}
                      placeholder="Hubungi Kami Sekarang"
                      disabled={isSubmitting}
                      className="h-8 text-sm"
                      data-ocid="input-cta-button-label"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="ctaButtonUrl" className="text-xs">
                      URL Tombol
                    </Label>
                    <Input
                      id="ctaButtonUrl"
                      value={ctaButtonUrl}
                      onChange={(e) => setCtaButtonUrl(e.target.value)}
                      placeholder="https://wa.me/..."
                      disabled={isSubmitting}
                      className="h-8 text-sm"
                      data-ocid="input-cta-button-url"
                    />
                  </div>
                </div>
              </section>

              {/* ── Status Publikasi ──────────────────────────────────────── */}
              <section>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <p className="text-sm font-medium">Status Publikasi</p>
                    <p className="text-xs text-muted-foreground">
                      {publishStatus
                        ? "Kendaraan ini terlihat di halaman publik"
                        : "Kendaraan ini masih tersembunyi (draft)"}
                    </p>
                  </div>
                  <Switch
                    checked={publishStatus}
                    onCheckedChange={setPublishStatus}
                    disabled={isSubmitting}
                    data-ocid="toggle-publish-status"
                  />
                </div>
              </section>
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-card">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="vehicle-form"
            disabled={isSubmitting || !vehicleName.trim()}
            style={{ backgroundColor: isSubmitting ? undefined : RED }}
            data-ocid="btn-submit-vehicle"
          >
            {isSubmitting ? "Menyimpan..." : vehicle ? "Perbarui" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
