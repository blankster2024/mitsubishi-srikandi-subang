import { Skeleton } from "@/components/ui/skeleton";
import { useGetVisitorStats } from "@/hooks/useVisitorStats";
import { useGetWebsiteSettings } from "@/hooks/useWebsiteSettings";
import {
  Activity,
  Eye,
  Heart,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  Users,
} from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiYoutube } from "react-icons/si";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier =
    typeof window !== "undefined"
      ? window.location.hostname
      : "mitsubishi-srikandi-subang";

  // Auto-refresh every 15 seconds
  const { data: visitorStats, isLoading } = useGetVisitorStats({
    refetchInterval: 15000,
  });
  const { data: settings } = useGetWebsiteSettings();

  const formatNumber = (num: bigint | undefined): string => {
    if (num === undefined) return "0";
    return Number(num).toLocaleString("id-ID");
  };

  // Dynamic values with fallbacks
  const phone = settings?.contactPhone || "0852-1234-0778";
  const email = settings?.contactEmail || "fuadmitsubishi2025@gmail.com";
  const address =
    settings?.dealerAddress ||
    "Jl. Otto Iskandardinata No.314, Subang, Jawa Barat 41211";
  const facebookUrl = settings?.facebookUrl || "https://facebook.com";
  const instagramUrl = settings?.instagramUrl || "https://instagram.com";
  const tiktokUrl = settings?.tiktokUrl || "https://tiktok.com";
  const youtubeUrl = settings?.youtubeUrl || "https://youtube.com";
  const footerAboutText =
    settings?.footerAboutText ||
    "Dealer resmi Mitsubishi di Subang, Jawa Barat. Melayani penjualan mobil keluarga dan niaga dengan layanan terbaik.";

  const waNumber = settings?.contactWhatsapp
    ? settings.contactWhatsapp.replace(/\D/g, "")
    : null;
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=Hai..%20Saya%20tertarik%20dengan%20produk%20mobil%20Mitsubishi..`
    : null;

  return (
    <footer className="bg-[#262729] text-white">
      <div className="container mx-auto px-4 pt-10 md:pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <img
              src="https://blob.caffeine.ai/v1/blob/?blob_hash=sha256%3A9ce99f9433d02f631bd8842e6c9aad8c2a89c5ecf5ce59c6465b0bcbacc265c6&owner_id=bskla-eiaaa-aaaan-q4qba-cai&project_id=019c76c5-c8d9-757e-ad55-3b3449510206"
              alt={settings?.siteName || "Logo"}
              className="h-12 w-auto object-contain mb-4"
            />
            <p className="text-gray-200 text-sm leading-relaxed">
              {footerAboutText}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hubungi Kami</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <Phone size={18} className="mt-0.5 shrink-0 text-[#C90010]" />
                <a
                  href={`tel:${phone}`}
                  className="text-gray-200 hover:text-gray-300 transition-colors"
                >
                  {phone}
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-[#C90010]" />
                <a
                  href={`mailto:${email}`}
                  className="text-gray-200 hover:text-gray-300 transition-colors break-all"
                >
                  {email}
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#C90010]" />
                <span className="text-gray-200">{address}</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-bold mb-4">Ikuti Kami</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#C90010] hover:bg-[#A00008] flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <SiFacebook size={20} />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#C90010] hover:bg-[#A00008] flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <SiInstagram size={20} />
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#C90010] hover:bg-[#A00008] flex items-center justify-center transition-colors"
                  aria-label="TikTok"
                >
                  <SiTiktok size={20} />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#C90010] hover:bg-[#A00008] flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <SiYoutube size={20} />
                </a>
              )}
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#C90010] hover:bg-[#A00008] flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <span className="sr-only">WhatsApp</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <title>WhatsApp</title>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              )}
            </div>
            <p className="text-gray-200 text-sm mt-2">
              Jam Operasional :{" "}
              {settings?.operationalHours || "Senin - Sabtu, 08.30 - 16.00"}
            </p>
          </div>

          {/* Visitor Stats */}
          <div>
            <h3 className="text-lg font-bold mb-4">Statistik Pengunjung</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-[#C90010]" />
                  <span className="text-gray-200">Total Pengunjung</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-5 w-16 bg-gray-700" />
                ) : (
                  <span className="font-bold text-[#C90010]">
                    {formatNumber(visitorStats?.totalVisitors)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#C90010]" />
                  <span className="text-gray-200">Trafik Hari Ini</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-5 w-16 bg-gray-700" />
                ) : (
                  <span className="font-bold text-[#C90010]">
                    {formatNumber(visitorStats?.visitorsToday)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity size={14} className="text-[#C90010]" />
                  <span className="text-gray-200">Pengguna Aktif</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-5 w-16 bg-gray-700" />
                ) : (
                  <span className="font-bold text-[#C90010]">
                    {formatNumber(visitorStats?.onlineNow)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye size={14} className="text-[#C90010]" />
                  <span className="text-gray-200">Tampilan Halaman</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-5 w-16 bg-gray-700" />
                ) : (
                  <span className="font-bold text-[#C90010]">
                    {formatNumber(visitorStats?.pageViewsToday)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-500 pt-6 text-center text-xs text-gray-300">
          <p>
            © {currentYear} Mitsubishi Srikandi Subang. All rights reserved. |
            Built with <Heart size={14} className="inline text-[#C90010]" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                appIdentifier,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C90010] hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
