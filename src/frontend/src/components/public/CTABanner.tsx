import SafeImage from "@/components/SafeImage";
import { useActor } from "@/hooks/useActor";
import { useGetWebsiteSettings } from "@/hooks/useWebsiteSettings";
import { useEffect, useState } from "react";

export default function CTABanner() {
  const { data: settings } = useGetWebsiteSettings();
  const { actor } = useActor();
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  const bannerImageId = settings?.ctaBannerImageId ?? null;

  useEffect(() => {
    if (!bannerImageId || !actor) return;
    let cancelled = false;
    actor
      .getPublicMediaAssetById(bannerImageId)
      .then((asset) => {
        if (cancelled) return;
        setBannerUrl(asset?.storageUrl ?? null);
      })
      .catch(() => {
        if (!cancelled) setBannerUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [bannerImageId, actor]);

  const imageSrc = bannerUrl || "/assets/uploads/CTA_Banner-1.png";

  return (
    <section className="w-full my-0 bg-[#252628]">
      <div className="container px-0">
        <SafeImage
          src={imageSrc}
          alt="CTA Banner"
          className="w-full h-auto"
          placeholderClassName="w-full h-[200px] bg-[#252628]"
        />
      </div>
    </section>
  );
}
