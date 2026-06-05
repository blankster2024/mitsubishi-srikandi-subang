import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllMediaAssets } from "@/hooks/useMediaAssets";
import { isPdfMimeType } from "@/utils/blobUrl";
import { FileText, Film } from "lucide-react";
import { useEffect, useState } from "react";

interface BannerImagePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (imageId: bigint) => void;
  value?: bigint;
  bannerType?: "main" | "cta";
  /** Filter assets shown in the picker. Default: "image" */
  mediaType?: "image" | "video" | "pdf" | "all";
}

export default function BannerImagePicker({
  open,
  onOpenChange,
  onSelect,
  value,
  bannerType = "main",
  mediaType = "image",
}: BannerImagePickerProps) {
  const { data: allAssets, isLoading } = useGetAllMediaAssets();
  const [selectedId, setSelectedId] = useState<string>(value?.toString() || "");

  useEffect(() => {
    setSelectedId(value?.toString() || "");
  }, [value]);

  const filteredAssets =
    allAssets?.filter((asset) => {
      if (mediaType === "all") return true;
      if (mediaType === "video") return asset.mimeType.startsWith("video/");
      if (mediaType === "pdf") return isPdfMimeType(asset.mimeType);
      return asset.mimeType.startsWith("image/");
    }) || [];

  const handleSelect = () => {
    if (selectedId) onSelect(BigInt(selectedId));
    onOpenChange(false);
  };

  const pickerTitle =
    mediaType === "video"
      ? "Pilih Video Banner"
      : mediaType === "pdf"
        ? "Pilih File PDF"
        : bannerType === "main"
          ? "Pilih Main Banner"
          : "Pilih CTA Banner";

  const emptyMessage =
    mediaType === "video"
      ? "Belum ada video. Upload MP4/WebM di Media Manager terlebih dahulu."
      : mediaType === "pdf"
        ? "Belum ada file PDF. Upload PDF di Media Manager terlebih dahulu."
        : "Belum ada gambar. Upload gambar di Media Manager terlebih dahulu.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[1100px] w-full max-h-[80vh] overflow-y-auto"
        data-ocid="media.dialog"
      >
        <DialogHeader>
          <DialogTitle>{pickerTitle}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground"
            data-ocid="media.empty_state"
          >
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-4">
            <RadioGroup value={selectedId} onValueChange={setSelectedId}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAssets.map((asset) => {
                  const assetIdString = asset.id.toString();
                  const isVideo = asset.mimeType.startsWith("video/");
                  const isPdf = isPdfMimeType(asset.mimeType);

                  return (
                    <label
                      key={assetIdString}
                      htmlFor={`asset-${assetIdString}`}
                      className={`block border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedId === assetIdString
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem
                          value={assetIdString}
                          id={`asset-${assetIdString}`}
                        />
                        <div className="flex-1">
                          <div className="space-y-2">
                            {isPdf ? (
                              <div className="w-full h-24 bg-red-50 rounded flex items-center justify-center">
                                <div className="text-center">
                                  <FileText className="h-10 w-10 mx-auto text-red-500" />
                                  <p className="text-xs text-red-600 font-semibold mt-1">
                                    PDF
                                  </p>
                                </div>
                              </div>
                            ) : isVideo ? (
                              <div className="relative w-full h-32 bg-gray-900 rounded overflow-hidden">
                                <video
                                  src={asset.storageUrl}
                                  className="w-full h-full object-cover"
                                  muted
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Film className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={asset.storageUrl}
                                alt={asset.filename}
                                className="w-full h-32 object-cover rounded"
                              />
                            )}
                            <div className="text-sm">
                              <p className="font-medium truncate">
                                {asset.filename}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(Number(asset.size) / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-ocid="media.cancel_button"
              >
                Batal
              </Button>
              <Button
                onClick={handleSelect}
                disabled={!selectedId}
                data-ocid="media.confirm_button"
              >
                {mediaType === "video"
                  ? "Pilih Video"
                  : mediaType === "pdf"
                    ? "Pilih PDF"
                    : "Pilih Gambar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
