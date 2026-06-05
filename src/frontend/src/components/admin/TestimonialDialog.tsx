import BannerImagePicker from "@/components/admin/BannerImagePicker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetAllMediaAssets } from "@/hooks/useMediaAssets";
import {
  useAddTestimonial,
  useUpdateTestimonial,
} from "@/hooks/useTestimonials";
import { useGetPublishedVehicles } from "@/hooks/useVehicles";
import type { Testimonial } from "@/types/local";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TestimonialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial?: Testimonial | null;
}

export default function TestimonialDialog({
  isOpen,
  onClose,
  testimonial,
}: TestimonialDialogProps) {
  const isEdit = !!testimonial;

  // ── All hooks first — NEVER place hooks after an early return ──────────────

  // ── form state — always safe defaults ──────────────────────────────────────
  const [customerPhotoId, setCustomerPhotoId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [vehicleType, setVehicleType] = useState<
    "" | "passenger" | "commercial"
  >("");
  const [vehicleRef, setVehicleRef] = useState("");
  const [vehicleRefType, setVehicleRefType] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleUrl, setVehicleUrl] = useState("");
  const [active, setActive] = useState(false);

  // ── image picker state ──────────────────────────────────────────────────────
  const [pickerOpen, setPickerOpen] = useState(false);

  // ── data hooks ──────────────────────────────────────────────────────────────
  const { data: mediaAssets } = useGetAllMediaAssets();
  const { data: allVehicles } = useGetPublishedVehicles();

  // Safe array access — always default to []
  const passengerVehicles = (allVehicles ?? []).filter(
    (v) => v.vehicleType !== "commercial",
  );
  const commercialVehicles = (allVehicles ?? []).filter(
    (v) => v.vehicleType === "commercial",
  );

  const addTestimonial = useAddTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const isLoading = addTestimonial.isPending || updateTestimonial.isPending;

  // ── Sync form when dialog opens or testimonial changes ────────────────────

  useEffect(() => {
    if (!isOpen) return;
    setCustomerPhotoId(testimonial?.customerPhotoId ?? "");
    setCustomerName(testimonial?.customerName ?? "");
    setCustomerCity(testimonial?.customerCity ?? "");
    setRating(typeof testimonial?.rating === "number" ? testimonial.rating : 5);
    setMessage(testimonial?.message ?? "");
    setVehicleRef(testimonial?.vehicleRef ?? "");
    setVehicleRefType(testimonial?.vehicleRefType ?? "");
    setVehicleName(testimonial?.vehicleName ?? "");
    setVehicleUrl(testimonial?.vehicleUrl ?? "");
    setActive(testimonial?.active ?? false);
    setVehicleType(
      testimonial?.vehicleRefType === "passenger"
        ? "passenger"
        : testimonial?.vehicleRefType === "commercial"
          ? "commercial"
          : "",
    );
    setHoverRating(0);
  }, [testimonial, isOpen]);

  // ── Guard: render nothing when dialog is closed ───────────────────────────
  if (!isOpen) return null;

  // ── vehicle type change ────────────────────────────────────────────────────
  const handleVehicleTypeChange = (val: string) => {
    // "none" is the sentinel for "— Tidak Ada —"; treat it as empty string
    const normalized = val === "none" ? "" : val;
    const t = normalized as "" | "passenger" | "commercial";
    setVehicleType(t);
    if (!t) {
      setVehicleRef("");
      setVehicleRefType("");
      setVehicleName("");
      setVehicleUrl("");
    }
  };

  // ── photo picker select ────────────────────────────────────────────────────
  const handlePhotoSelect = (assetId: bigint) => {
    const asset = (mediaAssets ?? []).find((a) => a.id === assetId);
    if (asset) {
      setCustomerPhotoId(asset.storageUrl);
    }
  };

  const photoUrl = customerPhotoId || "";

  // ── submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Nama pelanggan wajib diisi.");
      return;
    }
    if (!customerCity.trim()) {
      toast.error("Kota asal wajib diisi.");
      return;
    }
    if (!message.trim()) {
      toast.error("Pesan/testimoni wajib diisi.");
      return;
    }
    if (
      typeof rating !== "number" ||
      Number.isNaN(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      toast.error("Rating harus berupa angka antara 1 dan 5.");
      return;
    }

    const payload = {
      customerName: customerName.trim(),
      customerPhotoId: customerPhotoId ?? "",
      customerCity: customerCity.trim(),
      rating: typeof rating === "number" ? rating : 5,
      message: message.trim(),
      vehicleRef: vehicleRef ?? "",
      // Guard: never send "none" to backend — always send empty string
      vehicleRefType: vehicleRefType === "none" ? "" : (vehicleRefType ?? ""),
      vehicleName: vehicleName ?? "",
      vehicleUrl: vehicleUrl ?? "",
      active: active === true,
    };

    if (isEdit && testimonial) {
      updateTestimonial.mutate(
        { id: testimonial.id, ...payload },
        {
          onSuccess: () => {
            toast.success("Testimoni berhasil diperbarui.");
            onClose();
          },
          onError: (err) => {
            const msg =
              err instanceof Error ? err.message : "Terjadi kesalahan";
            toast.error(`Gagal memperbarui testimoni: ${msg}`);
          },
        },
      );
    } else {
      addTestimonial.mutate(payload, {
        onSuccess: () => {
          toast.success("Testimoni berhasil ditambahkan.");
          onClose();
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
          toast.error(`Gagal menambahkan testimoni: ${msg}`);
        },
      });
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="sm:max-w-[1100px] w-full max-h-[90vh] overflow-y-auto"
          data-ocid="testimonial.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Testimoni" : "Tambah Testimoni Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 py-4">
              {/* 1. Foto Pelanggan */}
              <div className="grid gap-2">
                <Label>Foto Pelanggan</Label>
                <div className="flex items-center gap-4">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Foto pelanggan"
                      className="w-16 h-16 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground text-xs text-center leading-tight px-1">
                      Belum ada foto
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerOpen(true)}
                    disabled={isLoading}
                    data-ocid="testimonial.upload_button"
                  >
                    {photoUrl ? "Ganti Foto" : "Pilih Foto"}
                  </Button>
                  {photoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomerPhotoId("")}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              </div>

              {/* 2. Nama Pelanggan */}
              <div className="grid gap-2">
                <Label htmlFor="customerName">
                  Nama Pelanggan <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama lengkap pelanggan"
                  required
                  disabled={isLoading}
                  data-ocid="testimonial.input"
                />
              </div>

              {/* 3. Kota Asal */}
              <div className="grid gap-2">
                <Label htmlFor="customerCity">
                  Kota Asal <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerCity"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="Surabaya, Medan, Makassar, dll"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* 4. Rating */}
              <div className="grid gap-2">
                <Label>
                  Rating <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      disabled={isLoading}
                      className="text-2xl cursor-pointer transition-transform hover:scale-110 disabled:cursor-not-allowed"
                      aria-label={`Rating ${star}`}
                    >
                      <span
                        className={
                          star <= displayRating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Rating: {rating}/5
                </p>
              </div>

              {/* 5. Pesan */}
              <div className="grid gap-2">
                <Label htmlFor="message">
                  Pesan / Testimoni <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ceritakan pengalaman pelanggan dengan produk/layanan kami..."
                  rows={4}
                  required
                  disabled={isLoading}
                  data-ocid="testimonial.textarea"
                />
              </div>

              {/* 6. Kendaraan yang Dibeli */}
              <div className="grid gap-3">
                <Label>Kendaraan yang Dibeli</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Tipe kendaraan dropdown */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="vehicleType"
                      className="text-sm text-muted-foreground"
                    >
                      Tipe Kendaraan
                    </Label>
                    <Select
                      value={vehicleType === "" ? "none" : vehicleType}
                      onValueChange={handleVehicleTypeChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        id="vehicleType"
                        data-ocid="testimonial.select"
                      >
                        <SelectValue placeholder="— Tidak Ada —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Tidak Ada —</SelectItem>
                        <SelectItem value="passenger">
                          Mobil Keluarga
                        </SelectItem>
                        <SelectItem value="commercial">Mobil Niaga</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vehicle selector — passenger */}
                  {vehicleType === "passenger" && (
                    <div className="grid gap-1.5">
                      <Label className="text-sm text-muted-foreground">
                        Pilih Kendaraan
                      </Label>
                      <Select
                        value={vehicleRef}
                        onValueChange={(slug) => {
                          const v = passengerVehicles.find(
                            (pv) => pv.slug === slug,
                          );
                          if (v) {
                            setVehicleRef(v.slug);
                            setVehicleRefType("passenger");
                            setVehicleName(v.vehicleName);
                            setVehicleUrl(`/mobil-keluarga/${v.slug}`);
                          }
                        }}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kendaraan..." />
                        </SelectTrigger>
                        <SelectContent>
                          {passengerVehicles.length === 0 ? (
                            <SelectItem value="_empty" disabled>
                              Tidak ada kendaraan tersedia
                            </SelectItem>
                          ) : (
                            passengerVehicles.map((v) => (
                              <SelectItem key={v.id.toString()} value={v.slug}>
                                {v.vehicleName}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Vehicle selector — commercial */}
                  {vehicleType === "commercial" && (
                    <div className="grid gap-1.5">
                      <Label className="text-sm text-muted-foreground">
                        Pilih Kendaraan
                      </Label>
                      <Select
                        value={vehicleRef}
                        onValueChange={(slug) => {
                          const v = commercialVehicles.find(
                            (cv) => cv.slug === slug,
                          );
                          if (v) {
                            setVehicleRef(v.slug);
                            setVehicleRefType("commercial");
                            setVehicleName(v.vehicleName);
                            setVehicleUrl(
                              `/mobil-niaga/${v.vehicleType}/${v.slug}`,
                            );
                          }
                        }}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kendaraan..." />
                        </SelectTrigger>
                        <SelectContent>
                          {commercialVehicles.length === 0 ? (
                            <SelectItem value="_empty" disabled>
                              Tidak ada kendaraan niaga tersedia
                            </SelectItem>
                          ) : (
                            commercialVehicles.map((v) => (
                              <SelectItem key={v.id.toString()} value={v.slug}>
                                {v.vehicleName}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {vehicleName && (
                  <p className="text-xs text-muted-foreground">
                    Kendaraan dipilih:{" "}
                    <span className="font-medium text-foreground">
                      {vehicleName}
                    </span>{" "}
                    — URL: <span className="font-mono">{vehicleUrl}</span>
                  </p>
                )}
              </div>

              {/* 7. Status Aktif */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="active"
                  checked={active}
                  onCheckedChange={(checked) => setActive(checked === true)}
                  disabled={isLoading}
                  data-ocid="testimonial.checkbox"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Tampilkan di halaman publik (Aktif)
                </Label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                data-ocid="testimonial.cancel_button"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-ocid="testimonial.submit_button"
              >
                {isLoading
                  ? "Menyimpan..."
                  : isEdit
                    ? "Simpan Perubahan"
                    : "Tambah Testimoni"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image picker dialog — only mount when needed */}
      {pickerOpen && (
        <BannerImagePicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={handlePhotoSelect}
          mediaType="image"
        />
      )}
    </>
  );
}
