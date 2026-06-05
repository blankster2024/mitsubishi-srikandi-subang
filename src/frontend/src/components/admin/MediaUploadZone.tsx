import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useActorContext } from "@/contexts/ActorContext";
import { useUploadMediaAsset } from "@/hooks/useMediaAssets";
import { AlertCircle, CheckCircle, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface UploadFile {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface MediaUploadZoneProps {
  onUploadSuccess?: () => void;
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

// File size limits
// Videos: 60MB internal limit (UI shows 50MB — accounts for browser rounding)
// Images & PDF: 5MB — practical limit for canister storage
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60MB internal (displayed as 50MB)
const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB

function getFileTypeLabel(mimeType: string): string {
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType === "application/pdf") return "PDF";
  return "Gambar";
}

export default function MediaUploadZone({
  onUploadSuccess,
}: MediaUploadZoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAsset = useUploadMediaAsset();
  const { actor, actorFetching } = useActorContext();

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Tipe file tidak didukung: ${file.type}. Gunakan JPG, PNG, WebP, PDF, MP4, WebM, atau MOV.`;
    }
    if (file.type.startsWith("video/") && file.size > MAX_VIDEO_SIZE) {
      return `File video terlalu besar: ${(file.size / 1024 / 1024).toFixed(1)}MB. Ukuran maksimal adalah 50MB.`;
    }
    if (file.type === "application/pdf" && file.size > MAX_PDF_SIZE) {
      return `File PDF terlalu besar: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maksimal 5MB.`;
    }
    if (file.type.startsWith("image/") && file.size > MAX_IMAGE_SIZE) {
      return `Ukuran gambar terlalu besar: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maksimal 5MB.`;
    }
    return null;
  }, []);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const uploadFiles: UploadFile[] = fileArray.map((file) => {
        const error = validateFile(file);
        return {
          file,
          status: error ? "error" : "pending",
          progress: 0,
          error: error || undefined,
        };
      });
      setFiles((prev) => [...prev, ...uploadFiles]);
    },
    [validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadSingleFile = async (uploadFile: UploadFile, index: number) => {
    if (!actor || actorFetching) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: "error", error: "Actor belum siap. Coba lagi." }
            : f,
        ),
      );
      return;
    }

    setFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, status: "uploading", progress: 0 } : f,
      ),
    );

    try {
      const arrayBuffer = await uploadFile.file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      await uploadAsset.mutateAsync({
        filename: uploadFile.file.name,
        mimeType: uploadFile.file.type,
        data,
        fileSize: BigInt(uploadFile.file.size),
        onProgress: (pct) => {
          setFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, progress: pct } : f)),
          );
        },
      });

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "success", progress: 100 } : f,
        ),
      );
      onUploadSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload gagal";
      // Only update the failed file's status; do NOT clear other data
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "error", error: errorMessage } : f,
        ),
      );
    }
  };

  const uploadAll = async () => {
    const pendingEntries = files
      .map((f, i) => ({ file: f, index: i }))
      .filter(({ file }) => file.status === "pending");
    for (const { file, index } of pendingEntries) {
      await uploadSingleFile(file, index);
    }
  };

  const clearCompleted = () =>
    setFiles((prev) => prev.filter((f) => f.status !== "success"));

  const hasPending = files.some((f) => f.status === "pending");
  const hasCompleted = files.some((f) => f.status === "success");

  return (
    <div className="space-y-4">
      {/* biome-ignore lint/a11y/useSemanticElements: drop zone needs onDrop */}
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        data-ocid="media.dropzone"
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary hover:bg-muted/50"
        }`}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-foreground">
          Drag &amp; drop file di sini
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          atau klik untuk memilih file
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG, WebP (maks. 5MB) · MP4, WebM, MOV (maks. 50MB) · PDF (maks.
          5MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,video/mp4,video/webm,video/quicktime,.mov"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadFile, index) => (
            <div
              key={`file-${uploadFile.file.name}-${index}`}
              className="flex items-center gap-3 p-3 border rounded-lg bg-card"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadFile.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getFileTypeLabel(uploadFile.file.type)}
                  {" · "}
                  {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploadFile.status === "uploading" && (
                  <Progress value={uploadFile.progress} className="mt-1 h-1" />
                )}
                {uploadFile.status === "error" && uploadFile.error && (
                  <p className="text-xs text-destructive mt-1">
                    {uploadFile.error}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {uploadFile.status === "success" && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {uploadFile.status === "error" && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                {uploadFile.status === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      uploadSingleFile(uploadFile, index);
                    }}
                  >
                    Upload
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex gap-2 justify-end">
            {hasCompleted && (
              <Button variant="outline" size="sm" onClick={clearCompleted}>
                Hapus yang Selesai
              </Button>
            )}
            {hasPending && (
              <Button
                size="sm"
                onClick={uploadAll}
                disabled={uploadAsset.isPending}
                data-ocid="media.upload_button"
              >
                {uploadAsset.isPending ? "Mengupload..." : "Upload Semua"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
