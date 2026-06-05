import type { MediaAsset } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActorContext } from "@/contexts/ActorContext";
import {
  useDeleteMediaAsset,
  useGetAllMediaAssets,
} from "@/hooks/useMediaAssets";
import { isImageMimeType, isPdfMimeType } from "@/utils/blobUrl";
import {
  Copy,
  Download,
  ExternalLink,
  FileText,
  Film,
  ImageIcon,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function isVideoMimeType(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}

function formatFileSize(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

interface AssetCardProps {
  asset: MediaAsset;
  isActorReady: boolean;
  isDeleting: boolean;
  onCopyId: (id: bigint) => void;
  onDeleteClick: (asset: MediaAsset) => void;
}

function ImageCard({
  asset,
  isActorReady,
  isDeleting,
  onCopyId,
  onDeleteClick,
}: AssetCardProps) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {asset.storageUrl && !imgError ? (
          <img
            src={asset.storageUrl}
            alt={asset.filename}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-muted-foreground text-center p-4">
            <ImageIcon className="h-12 w-12 mx-auto mb-1" />
            <p className="text-xs">Gagal muat</p>
          </div>
        )}
      </div>
      <div className="p-2 border-t">
        <p className="text-xs font-medium truncate" title={asset.filename}>
          {asset.filename}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(asset.size)}
        </p>
        <div className="flex gap-1 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onCopyId(asset.id)}
          >
            <Copy className="h-3 w-3 mr-1" /> ID
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onDeleteClick(asset)}
            disabled={!isActorReady || isDeleting}
            data-ocid="media.delete_button"
          >
            <Trash2 className="h-3 w-3 mr-1" /> Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}

function VideoCard({
  asset,
  isActorReady,
  isDeleting,
  onCopyId,
  onDeleteClick,
}: AssetCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="aspect-video bg-gray-900 flex items-center justify-center overflow-hidden relative">
        {asset.storageUrl ? (
          <video
            src={asset.storageUrl}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
        ) : (
          <Film className="h-12 w-12 text-blue-400" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <Film className="h-8 w-8 text-white/70" />
        </div>
      </div>
      <div className="p-2 border-t">
        <p className="text-xs font-medium truncate" title={asset.filename}>
          {asset.filename}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(asset.size)} · Video
        </p>
        <div className="flex gap-1 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onCopyId(asset.id)}
          >
            <Copy className="h-3 w-3 mr-1" /> ID
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onDeleteClick(asset)}
            disabled={!isActorReady || isDeleting}
            data-ocid="media.delete_button"
          >
            <Trash2 className="h-3 w-3 mr-1" /> Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}

function PdfCard({
  asset,
  isActorReady,
  isDeleting,
  onCopyId,
  onDeleteClick,
}: AssetCardProps) {
  const handlePreview = () => {
    if (asset.storageUrl) window.open(asset.storageUrl, "_blank");
  };
  const handleDownload = () => {
    if (!asset.storageUrl) return;
    const a = document.createElement("a");
    a.href = asset.storageUrl;
    a.download = asset.filename;
    a.click();
  };
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="aspect-square bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-2 text-red-500" />
          <p className="text-xs text-red-600 font-semibold">PDF</p>
        </div>
      </div>
      <div className="p-2 border-t">
        <p className="text-xs font-medium truncate" title={asset.filename}>
          {asset.filename}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(asset.size)} · PDF
        </p>
        <div className="grid grid-cols-2 gap-1 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handlePreview}
          >
            <ExternalLink className="h-3 w-3 mr-1" /> Buka
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3 mr-1" /> Unduh
          </Button>
        </div>
        <div className="flex gap-1 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onCopyId(asset.id)}
          >
            <Copy className="h-3 w-3 mr-1" /> ID
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onDeleteClick(asset)}
            disabled={!isActorReady || isDeleting}
            data-ocid="media.delete_button"
          >
            <Trash2 className="h-3 w-3 mr-1" /> Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MediaAssetGrid() {
  const { actor, actorFetching } = useActorContext();
  const { data: assets, isLoading, error, refetch } = useGetAllMediaAssets();
  const deleteAsset = useDeleteMediaAsset();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);

  const handleCopyId = (assetId: bigint) => {
    navigator.clipboard.writeText(assetId.toString());
    toast.success("ID asset berhasil disalin");
  };

  const handleDeleteClick = (asset: MediaAsset) => {
    if (!actor) {
      toast.error("Sistem belum siap.");
      return;
    }
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!assetToDelete || !actor) return;
    deleteAsset.mutate(assetToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setAssetToDelete(null);
        toast.success("File berhasil dihapus");
      },
      onError: () => {
        setDeleteDialogOpen(false);
        setAssetToDelete(null);
        toast.error("Gagal menghapus file");
      },
    });
  };

  if (isLoading || actorFetching) {
    return (
      <div className="space-y-6">
        {["Gambar", "Video", "Brosur PDF"].map((label) => (
          <Card key={label}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error && !assets) {
    return (
      <div
        className="text-center py-12 space-y-3"
        data-ocid="media.error_state"
      >
        <p className="text-destructive font-medium">
          Gagal memuat media. Pastikan Anda sudah login sebagai admin.
        </p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Terjadi kesalahan tidak diketahui."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          data-ocid="media.button"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Coba Lagi
        </Button>
      </div>
    );
  }

  const images = (assets || []).filter((a) => isImageMimeType(a.mimeType));
  const videos = (assets || []).filter((a) => isVideoMimeType(a.mimeType));
  const pdfs = (assets || []).filter((a) => isPdfMimeType(a.mimeType));
  const isActorReady = !!actor && !actorFetching;

  const cardProps = (asset: MediaAsset): AssetCardProps => ({
    asset,
    isActorReady,
    isDeleting: deleteAsset.isPending && assetToDelete?.id === asset.id,
    onCopyId: handleCopyId,
    onDeleteClick: handleDeleteClick,
  });

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-green-600" />
              Gambar
              <span className="text-muted-foreground font-normal text-sm">
                ({images.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {images.length === 0 ? (
              <p
                className="text-sm text-muted-foreground text-center py-4"
                data-ocid="media.empty_state"
              >
                Belum ada gambar. Upload JPG, PNG, atau WebP.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((a, idx) => (
                  <div
                    key={a.id.toString()}
                    data-ocid={`media.item.${idx + 1}`}
                  >
                    <ImageCard {...cardProps(a)} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Film className="h-4 w-4 text-blue-600" />
              Video
              <span className="text-muted-foreground font-normal text-sm">
                ({videos.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada video. Upload MP4, WebM, atau MOV.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {videos.map((a, idx) => (
                  <div
                    key={a.id.toString()}
                    data-ocid={`media.item.${idx + 1}`}
                  >
                    <VideoCard {...cardProps(a)} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-600" />
              Brosur PDF
              <span className="text-muted-foreground font-normal text-sm">
                ({pdfs.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pdfs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada brosur PDF. Upload file PDF.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pdfs.map((a, idx) => (
                  <div
                    key={a.id.toString()}
                    data-ocid={`media.item.${idx + 1}`}
                  >
                    <PdfCard {...cardProps(a)} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-ocid="media.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus file "{assetToDelete?.filename}
              "? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="media.cancel_button"
              onClick={() => {
                setDeleteDialogOpen(false);
                setAssetToDelete(null);
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="media.confirm_button"
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
