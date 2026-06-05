import MediaAssetGrid from "@/components/admin/MediaAssetGrid";
import MediaUploadZone from "@/components/admin/MediaUploadZone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActorContext } from "@/contexts/ActorContext";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function MediaManagerPage() {
  const queryClient = useQueryClient();
  const { actor } = useActorContext();
  const [resetting, setResetting] = useState(false);

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["mediaAssets"] });
  };

  const handleResetMediaData = async () => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus SEMUA data media? Tindakan ini tidak dapat dibatalkan.",
    );
    if (!confirmed) return;

    setResetting(true);
    try {
      if (!actor) throw new Error("Actor belum siap");
      await actor.clearAllMediaAssets();
      queryClient.invalidateQueries({ queryKey: ["mediaAssets"] });
    } catch (err) {
      alert(`Gagal mereset data media: ${String(err)}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Media Manager</h1>
          <p className="text-muted-foreground">
            Kelola file media untuk website — Gambar, Video, dan Brosur PDF
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleResetMediaData}
          disabled={resetting}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {resetting ? "Mereset..." : "Reset Media Data"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUploadZone onUploadSuccess={handleUploadSuccess} />
        </CardContent>
      </Card>

      <MediaAssetGrid />
    </div>
  );
}
