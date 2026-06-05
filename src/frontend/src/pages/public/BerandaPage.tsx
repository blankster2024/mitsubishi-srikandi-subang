import ArtikelTerbaru from "@/components/public/ArtikelTerbaru";
import CTABanner from "@/components/public/CTABanner";
import HighlightMobilKeluarga from "@/components/public/HighlightMobilKeluarga";
import HighlightMobilNiaga from "@/components/public/HighlightMobilNiaga";
import InfoBar from "@/components/public/InfoBar";
import MainBanner from "@/components/public/MainBanner";
import ProdukUnggulan from "@/components/public/ProdukUnggulan";
import SearchProduk from "@/components/public/SearchProduk";
import SpecialFeatures from "@/components/public/SpecialFeatures";
import TentangKami from "@/components/public/TentangKami";

export default function BerandaPage() {
  return (
    <div className="pb-1 md:pb-0">
      <MainBanner />
      <InfoBar />
      <HighlightMobilKeluarga />
      <HighlightMobilNiaga />
      <CTABanner />
      <TentangKami />
      <SpecialFeatures />

      {/* Stay Connected + Artikel Terbaru — two columns */}
      <div className="bg-[#E5E7EB]">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ArtikelTerbaru embedded={true} />
            <SearchProduk embedded={true} />
          </div>
        </div>
      </div>

      <ProdukUnggulan />
    </div>
  );
}
