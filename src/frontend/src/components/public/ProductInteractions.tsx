import { Button } from "@/components/ui/button";
import { useProductInteractions } from "@/hooks/useProductInteractions";
import { Heart, Share2 } from "lucide-react";

interface ProductInteractionsProps {
  vehicleId: bigint;
}

export default function ProductInteractions({
  vehicleId,
}: ProductInteractionsProps) {
  const { likeCount, shareCount, likeProduct, shareProduct } =
    useProductInteractions(vehicleId);

  const handleLike = () => {
    likeProduct();
  };

  const handleShare = () => {
    shareProduct();
    // Could also trigger native share API here
    if (navigator.share) {
      navigator
        .share({
          title: "Lihat kendaraan ini",
          url: window.location.href,
        })
        .catch(() => {
          // User cancelled or share failed
        });
    }
  };

  return (
    <div className="flex gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleLike}
        className="flex items-center gap-2"
      >
        <Heart className="h-4 w-4" />
        {Number(likeCount)} Suka
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        {Number(shareCount)} Bagikan
      </Button>
    </div>
  );
}
