import type { WebsiteSettings } from "@/backend";
import BannerImagePicker from "@/components/admin/BannerImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetMediaAssetById } from "@/hooks/useMediaAssets";
import {
  useGetWebsiteSettings,
  useUpdateWebsiteSettings,
} from "@/hooks/useWebsiteSettings";
import { validateDelegationIdentity } from "@/utils/validation";
import { Film, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Reusable media picker field ────────────────────────────────────────────
interface MediaPickerFieldProps {
  label: string;
  assetId: bigint | undefined;
  onSelect: (id: bigint) => void;
  onClear: () => void;
  pickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;
  buttonOcid: string;
  disabled?: boolean;
  mediaType?: "image" | "video" | "all";
}

function MediaPickerField({
  label,
  assetId,
  onSelect,
  onClear,
  pickerOpen,
  setPickerOpen,
  buttonOcid,
  disabled,
  mediaType = "image",
}: MediaPickerFieldProps) {
  const { data: asset, isLoading } = useGetMediaAssetById(assetId ?? null);
  const isVideo = asset?.mimeType.startsWith("video/") ?? false;
  const previewUrl = asset?.storageUrl || null;

  return (
    <>
      <div className="space-y-2">
        <Label>{label}</Label>
        {isLoading ? (
          <Skeleton className="w-full h-32" />
        ) : previewUrl ? (
          <div className="border rounded-lg overflow-hidden">
            {isVideo ? (
              <div className="relative w-full h-32 bg-gray-900">
                <video
                  src={previewUrl}
                  className="h-32 w-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <Film className="h-3 w-3" />
                  {asset?.filename}
                </div>
              </div>
            ) : (
              <img
                src={previewUrl}
                alt={label}
                className="h-32 w-full object-cover"
              />
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
            {mediaType === "video" ? (
              <Film className="h-8 w-8 opacity-40" />
            ) : null}
            <span>
              Belum ada {mediaType === "video" ? "video" : "media"} dipilih
            </span>
          </div>
        )}

        {assetId && asset && (
          <p className="text-xs text-muted-foreground">
            {asset.filename} · {(Number(asset.size) / 1024 / 1024).toFixed(2)}{" "}
            MB · ID: {assetId.toString()}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid={buttonOcid}
            onClick={() => setPickerOpen(true)}
            disabled={disabled}
          >
            {mediaType === "video" ? "Pilih Video" : "Pilih Media"}
          </Button>
          {assetId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onClear}
              disabled={disabled}
            >
              Hapus
            </Button>
          )}
        </div>
      </div>

      <BannerImagePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(id) => {
          onSelect(id);
          setPickerOpen(false);
        }}
        value={assetId}
        bannerType="main"
        mediaType={mediaType === "all" ? "all" : mediaType}
      />
    </>
  );
}

// ─── Section card wrapper ────────────────────────────────────────────────────
function SectionCard({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6 space-y-5">
      <h2 className="text-lg font-semibold text-foreground tracking-tight">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function WebsiteSettingsPage() {
  const { identity } = useInternetIdentity();
  const { data: settings, isLoading } = useGetWebsiteSettings();
  const updateSettings = useUpdateWebsiteSettings();

  const [mainBannerPickerOpen, setMainBannerPickerOpen] = useState(false);
  const [mainBanner2PickerOpen, setMainBanner2PickerOpen] = useState(false);
  const [videoBannerPickerOpen, setVideoBannerPickerOpen] = useState(false);
  const [ctaBannerPickerOpen, setCtaBannerPickerOpen] = useState(false);
  const [consultantPhotoPickerOpen, setConsultantPhotoPickerOpen] =
    useState(false);

  const [mainBannerImageId, setMainBannerImageId] = useState<
    bigint | undefined
  >(undefined);
  const [mainBannerImageId2, setMainBannerImageId2] = useState<
    bigint | undefined
  >(undefined);
  const [mainBannerVideoId, setMainBannerVideoId] = useState<
    bigint | undefined
  >(undefined);
  const [ctaBannerImageId, setCtaBannerImageId] = useState<bigint | undefined>(
    undefined,
  );
  const [salesConsultantPhotoId, setSalesConsultantPhotoId] = useState<
    bigint | undefined
  >(undefined);
  const [homepageBannerMode, setHomepageBannerMode] =
    useState<string>("1 image");

  const [formData, setFormData] = useState({
    siteName: "",
    contactPhone: "",
    contactWhatsapp: "",
    contactEmail: "",
    dealerAddress: "",
    operationalHours: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    salesConsultantName: "",
    footerAboutText: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName ?? "",
        contactPhone: settings.contactPhone ?? "",
        contactWhatsapp: settings.contactWhatsapp ?? "",
        contactEmail: settings.contactEmail ?? "",
        dealerAddress: settings.dealerAddress ?? "",
        operationalHours: settings.operationalHours ?? "",
        facebookUrl: settings.facebookUrl ?? "",
        instagramUrl: settings.instagramUrl ?? "",
        tiktokUrl: settings.tiktokUrl ?? "",
        youtubeUrl: settings.youtubeUrl ?? "",
        salesConsultantName:
          typeof settings.salesConsultantName === "string"
            ? settings.salesConsultantName
            : Array.isArray(settings.salesConsultantName)
              ? ((settings.salesConsultantName as string[])[0] ?? "")
              : "",
        footerAboutText:
          typeof settings.footerAboutText === "string"
            ? settings.footerAboutText
            : Array.isArray(settings.footerAboutText)
              ? ((settings.footerAboutText as string[])[0] ?? "")
              : "",
      });
      setMainBannerImageId(
        typeof settings.mainBannerImageId === "bigint"
          ? settings.mainBannerImageId
          : undefined,
      );
      setMainBannerImageId2(
        typeof settings.mainBannerImageId2 === "bigint"
          ? settings.mainBannerImageId2
          : undefined,
      );
      setMainBannerVideoId(
        typeof settings.mainBannerVideoId === "bigint"
          ? settings.mainBannerVideoId
          : undefined,
      );
      setCtaBannerImageId(
        typeof settings.ctaBannerImageId === "bigint"
          ? settings.ctaBannerImageId
          : undefined,
      );
      setSalesConsultantPhotoId(
        typeof settings.salesConsultantPhotoId === "bigint"
          ? settings.salesConsultantPhotoId
          : undefined,
      );
      setHomepageBannerMode(
        typeof settings.homepageBannerMode === "string"
          ? settings.homepageBannerMode
          : Array.isArray(settings.homepageBannerMode)
            ? ((settings.homepageBannerMode as string[])[0] ?? "1 image")
            : "1 image",
      );
    }
  }, [settings]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateDelegationIdentity(identity);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const settingsData: WebsiteSettings = {
      siteName: formData.siteName,
      contactPhone: formData.contactPhone,
      contactWhatsapp: formData.contactWhatsapp,
      contactEmail: formData.contactEmail,
      dealerAddress: formData.dealerAddress,
      operationalHours: formData.operationalHours,
      facebookUrl: formData.facebookUrl,
      instagramUrl: formData.instagramUrl,
      tiktokUrl: formData.tiktokUrl,
      youtubeUrl: formData.youtubeUrl,
      lastUpdated: BigInt(Date.now()) * BigInt(1_000_000),
      mainBannerImageId: mainBannerImageId,
      mainBannerImageId2: mainBannerImageId2,
      mainBannerVideoId: mainBannerVideoId,
      ctaBannerImageId: ctaBannerImageId,
      salesConsultantPhotoId: salesConsultantPhotoId,
      homepageBannerMode: homepageBannerMode || undefined,
      salesConsultantName: formData.salesConsultantName || undefined,
      footerAboutText: formData.footerAboutText || undefined,
    };

    try {
      await updateSettings.mutateAsync(settingsData);
      toast.success("Pengaturan berhasil disimpan!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(`Gagal menyimpan: ${message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const isPending = updateSettings.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Pengaturan Website
        </h1>
      </div>

      <SectionCard title="Main Banner">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Image Banner
          </p>
          <div className="space-y-5">
            <MediaPickerField
              label="Image 1"
              assetId={mainBannerImageId}
              onSelect={setMainBannerImageId}
              onClear={() => setMainBannerImageId(undefined)}
              pickerOpen={mainBannerPickerOpen}
              setPickerOpen={setMainBannerPickerOpen}
              buttonOcid="settings.main_banner_image1.button"
              disabled={isPending}
              mediaType="image"
            />
            <MediaPickerField
              label="Image 2"
              assetId={mainBannerImageId2}
              onSelect={setMainBannerImageId2}
              onClear={() => setMainBannerImageId2(undefined)}
              pickerOpen={mainBanner2PickerOpen}
              setPickerOpen={setMainBanner2PickerOpen}
              buttonOcid="settings.main_banner_image2.button"
              disabled={isPending}
              mediaType="image"
            />
          </div>
        </div>

        <div className="pt-1">
          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <Film className="h-4 w-4" /> Video Banner
          </p>
          <MediaPickerField
            label="Video Banner (MP4)"
            assetId={mainBannerVideoId}
            onSelect={setMainBannerVideoId}
            onClear={() => setMainBannerVideoId(undefined)}
            pickerOpen={videoBannerPickerOpen}
            setPickerOpen={setVideoBannerPickerOpen}
            buttonOcid="settings.main_banner_video.button"
            disabled={isPending}
            mediaType="video"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Upload file MP4 maks. 50MB di Media Manager, lalu pilih di sini.
          </p>
        </div>

        <div className="pt-1 border-t">
          <p className="text-sm font-medium mb-3">Banner Mode</p>
          <p className="text-xs text-muted-foreground mb-3">
            Pilih jenis banner yang ditampilkan di homepage. Semua field media
            tetap tersimpan.
          </p>
          <RadioGroup
            value={homepageBannerMode}
            onValueChange={setHomepageBannerMode}
            disabled={isPending}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="1 image"
                id="mode-1image"
                data-ocid="settings.banner_mode_1image.radio"
              />
              <Label
                htmlFor="mode-1image"
                className="cursor-pointer font-normal"
              >
                Image Statis — tampilkan Image 1 saja
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="2 image"
                id="mode-2image"
                data-ocid="settings.banner_mode_2image.radio"
              />
              <Label
                htmlFor="mode-2image"
                className="cursor-pointer font-normal"
              >
                Image Slider — slide Image 1 &amp; Image 2
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="video"
                id="mode-video"
                data-ocid="settings.banner_mode_video.radio"
              />
              <Label
                htmlFor="mode-video"
                className="cursor-pointer font-normal"
              >
                Video Banner — tampilkan video
              </Label>
            </div>
          </RadioGroup>
        </div>
      </SectionCard>

      <SectionCard title="CTA Banner">
        <MediaPickerField
          label="CTA Banner"
          assetId={ctaBannerImageId}
          onSelect={setCtaBannerImageId}
          onClear={() => setCtaBannerImageId(undefined)}
          pickerOpen={ctaBannerPickerOpen}
          setPickerOpen={setCtaBannerPickerOpen}
          buttonOcid="settings.cta_banner.button"
          disabled={isPending}
          mediaType="image"
        />
      </SectionCard>

      <SectionCard title="Sales Profile">
        <MediaPickerField
          label="Foto Sales Consultant"
          assetId={salesConsultantPhotoId}
          onSelect={setSalesConsultantPhotoId}
          onClear={() => setSalesConsultantPhotoId(undefined)}
          pickerOpen={consultantPhotoPickerOpen}
          setPickerOpen={setConsultantPhotoPickerOpen}
          buttonOcid="settings.consultant_photo.button"
          disabled={isPending}
          mediaType="image"
        />
        <div className="space-y-2">
          <Label htmlFor="salesConsultantName">Nama Sales Consultant</Label>
          <Input
            id="salesConsultantName"
            data-ocid="settings.sales_name.input"
            value={formData.salesConsultantName}
            onChange={(e) =>
              handleInputChange("salesConsultantName", e.target.value)
            }
            placeholder="Contoh: Budi Santoso"
            disabled={isPending}
          />
        </div>
      </SectionCard>

      <SectionCard title="Informasi Situs">
        <div className="space-y-2">
          <Label htmlFor="footerAboutText">
            Deskripsi Tentang Kami (Footer)
          </Label>
          <Textarea
            id="footerAboutText"
            data-ocid="settings.footer_about.textarea"
            value={formData.footerAboutText}
            onChange={(e) =>
              handleInputChange("footerAboutText", e.target.value)
            }
            rows={4}
            placeholder="Tulis deskripsi singkat tentang dealer untuk ditampilkan di footer..."
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siteName">Nama Situs</Label>
          <Input
            id="siteName"
            data-ocid="settings.site_name.input"
            value={formData.siteName}
            onChange={(e) => handleInputChange("siteName", e.target.value)}
            placeholder="Contoh: Mitsubishi Srikandi Subang"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="operationalHours">Jam Operasional</Label>
          <Input
            id="operationalHours"
            data-ocid="settings.operational_hours.input"
            value={formData.operationalHours}
            onChange={(e) =>
              handleInputChange("operationalHours", e.target.value)
            }
            placeholder="Contoh: Senin - Sabtu: 08:30 - 16:00"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Nomor Telepon</Label>
          <Input
            id="contactPhone"
            data-ocid="settings.contact_phone.input"
            value={formData.contactPhone}
            onChange={(e) => handleInputChange("contactPhone", e.target.value)}
            placeholder="Contoh: 0852-1234-0778"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactWhatsapp">Nomor WhatsApp</Label>
          <Input
            id="contactWhatsapp"
            data-ocid="settings.contact_whatsapp.input"
            value={formData.contactWhatsapp}
            onChange={(e) =>
              handleInputChange("contactWhatsapp", e.target.value)
            }
            placeholder="Contoh: 6285212340778"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email</Label>
          <Input
            id="contactEmail"
            data-ocid="settings.contact_email.input"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleInputChange("contactEmail", e.target.value)}
            placeholder="Contoh: info@mitsubishi-subang.com"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dealerAddress">Alamat Dealer</Label>
          <Textarea
            id="dealerAddress"
            data-ocid="settings.dealer_address.textarea"
            value={formData.dealerAddress}
            onChange={(e) => handleInputChange("dealerAddress", e.target.value)}
            rows={3}
            placeholder="Contoh: Jl. Otto Iskandardinata No.314, Subang, Jawa Barat 41211"
            disabled={isPending}
          />
        </div>
      </SectionCard>

      <SectionCard title="Media Sosial">
        <div className="space-y-2">
          <Label htmlFor="facebookUrl">Facebook Url</Label>
          <Input
            id="facebookUrl"
            data-ocid="settings.facebook_url.input"
            value={formData.facebookUrl}
            onChange={(e) => handleInputChange("facebookUrl", e.target.value)}
            placeholder="https://facebook.com/..."
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagramUrl">Instagram Url</Label>
          <Input
            id="instagramUrl"
            data-ocid="settings.instagram_url.input"
            value={formData.instagramUrl}
            onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
            placeholder="https://instagram.com/..."
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tiktokUrl">Tiktok Url</Label>
          <Input
            id="tiktokUrl"
            data-ocid="settings.tiktok_url.input"
            value={formData.tiktokUrl}
            onChange={(e) => handleInputChange("tiktokUrl", e.target.value)}
            placeholder="https://tiktok.com/@..."
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="youtubeUrl">Youtube Url</Label>
          <Input
            id="youtubeUrl"
            data-ocid="settings.youtube_url.input"
            value={formData.youtubeUrl}
            onChange={(e) => handleInputChange("youtubeUrl", e.target.value)}
            placeholder="https://youtube.com/@..."
            disabled={isPending}
          />
        </div>
      </SectionCard>

      <div className="flex justify-end pb-8">
        <Button
          type="submit"
          data-ocid="settings.submit_button"
          disabled={isPending}
          className="min-w-[180px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Pengaturan"
          )}
        </Button>
      </div>
    </form>
  );
}
