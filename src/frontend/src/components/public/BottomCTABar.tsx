import { useGetPublishedCommercialVehicles } from "@/hooks/useCommercialVehicles";
import { useGetPublishedVehicles } from "@/hooks/useVehicles";
import { useGetWebsiteSettings } from "@/hooks/useWebsiteSettings";
import { Link } from "@tanstack/react-router";
import {
  Calculator,
  ChevronDown,
  ChevronRight,
  Menu,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function BottomCTABar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [openSubAccordion, setOpenSubAccordion] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { data: settings } = useGetWebsiteSettings();
  const { data: passengerVehicles = [] } = useGetPublishedVehicles();
  const { data: commercialVehicles = [] } = useGetPublishedCommercialVehicles();

  const phone = settings?.contactPhone || "0852-1234-0778";
  const waNumber = settings?.contactWhatsapp
    ? settings.contactWhatsapp.replace(/\D/g, "")
    : "6285212340778";
  const waLink = `https://wa.me/${waNumber}?text=Hai..%20Saya%20tertarik%20dengan%20produk%20mobil%20Mitsubishi..`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenAccordion(null);
    setOpenSubAccordion(null);
  };

  // Group commercial vehicles by category
  const niagaByCategory = commercialVehicles.reduce<
    Record<string, typeof commercialVehicles>
  >((acc, v) => {
    const cat = (v.category || "Lainnya").trim();
    const key = cat.toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});
  const niagaCategories = Object.keys(niagaByCategory).map((key) => ({
    key,
    label: niagaByCategory[key][0].category,
    vehicles: niagaByCategory[key],
  }));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* CTA Bar */}
      <div className="bg-white border-t shadow-lg h-[50px] flex items-center">
        <button
          type="button"
          onClick={() => {
            window.location.href = `tel:${phone}`;
          }}
          className="flex-1 h-full flex flex-col items-center justify-center bg-[#C90010] text-white hover:bg-[#A00008] transition-colors"
        >
          <Phone size={18} />
          <span className="text-xs mt-1">Call</span>
        </button>
        <button
          type="button"
          onClick={() => window.open(waLink, "_blank")}
          className="flex-1 h-full flex flex-col items-center justify-center bg-[#398E3D] text-white hover:bg-[#2d7230] transition-colors"
        >
          <MessageCircle size={18} />
          <span className="text-xs mt-1">WhatsApp</span>
        </button>
        <Link
          to="/simulasi-kredit"
          className="flex-1 h-full flex flex-col items-center justify-center bg-[#FEA500] text-white hover:bg-[#e59400] transition-colors"
        >
          <Calculator size={18} />
          <span className="text-xs mt-1">Simulasi</span>
        </Link>
        {/* Menu button — relative wrapper for popup */}
        <div className="flex-1 h-full relative" ref={menuRef}>
          <button
            type="button"
            ref={buttonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full h-full flex flex-col items-center justify-center bg-[#0166C0] text-white hover:bg-[#0154a3] transition-colors"
          >
            <Menu size={18} />
            <span className="text-xs mt-1">Menu</span>
          </button>

          {/* Popup Menu — opens upward, same width as button (w-full of parent) */}
          {menuOpen && (
            <div className="absolute bottom-full right-0 w-full bg-[#0357A1] text-white rounded-t-lg shadow-2xl overflow-hidden">
              {/* Beranda */}
              <Link
                to="/"
                onClick={closeMenu}
                className="flex items-center px-4 py-2.5 hover:bg-white/10 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-200 [animation-delay:0ms]"
                data-ocid="bottom_cta.menu.beranda"
              >
                Beranda
              </Link>
              <div className="border-t border-white/20 mx-3" />

              {/* Mobil Keluarga accordion */}
              <button
                type="button"
                onClick={() =>
                  setOpenAccordion(
                    openAccordion === "keluarga" ? null : "keluarga",
                  )
                }
                className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/10 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-200 [animation-delay:50ms]"
                data-ocid="bottom_cta.menu.keluarga_toggle"
              >
                <span>Mobil Keluarga</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                    openAccordion === "keluarga" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "keluarga" && (
                <div>
                  {passengerVehicles.map((v, i) => (
                    <Link
                      key={v.slug}
                      to="/mobil-keluarga/$slug"
                      params={{ slug: v.slug }}
                      onClick={closeMenu}
                      className="flex items-center pl-6 pr-4 py-2 text-sm hover:bg-white/10 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-200"
                      style={{ animationDelay: `${i * 50}ms` }}
                      data-ocid={`bottom_cta.menu.keluarga.item.${i + 1}`}
                    >
                      <ChevronRight className="w-3 h-3 mr-1.5 opacity-60 shrink-0" />
                      <span className="truncate">{v.vehicleName}</span>
                    </Link>
                  ))}
                </div>
              )}
              <div className="border-t border-white/20 mx-3" />

              {/* Mobil Niaga accordion */}
              <button
                type="button"
                onClick={() =>
                  setOpenAccordion(openAccordion === "niaga" ? null : "niaga")
                }
                className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-white/10 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-200 [animation-delay:100ms]"
                data-ocid="bottom_cta.menu.niaga_toggle"
              >
                <span>Mobil Niaga</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                    openAccordion === "niaga" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "niaga" && (
                <div>
                  {niagaCategories.map((cat, ci) => (
                    <div key={cat.key}>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSubAccordion(
                            openSubAccordion === cat.key ? null : cat.key,
                          )
                        }
                        className="flex items-center justify-between w-full pl-6 pr-4 py-2 bg-white/5 hover:bg-white/10 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-200"
                        style={{ animationDelay: `${ci * 50}ms` }}
                        data-ocid={`bottom_cta.menu.niaga.${cat.key}_toggle`}
                      >
                        <span className="text-sm">{cat.label}</span>
                        <ChevronRight
                          className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                            openSubAccordion === cat.key ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                      {openSubAccordion === cat.key && (
                        <div>
                          {cat.vehicles.map((v, vi) => (
                            <Link
                              key={v.slug}
                              to="/mobil-niaga/$kategori/$slug"
                              params={{ kategori: cat.key, slug: v.slug }}
                              onClick={closeMenu}
                              className="flex items-center pl-10 pr-4 py-1.5 text-xs hover:bg-white/10 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-200"
                              style={{ animationDelay: `${vi * 40}ms` }}
                              data-ocid={`bottom_cta.menu.niaga.${cat.key}.item.${vi + 1}`}
                            >
                              <span className="text-white/60 mr-1.5">›</span>
                              <span className="truncate">{v.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-white/20 mx-3" />

              {/* Promo */}
              <Link
                to="/promo"
                onClick={closeMenu}
                className="flex items-center px-4 py-2.5 hover:bg-white/10 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-200 [animation-delay:150ms]"
                data-ocid="bottom_cta.menu.promo"
              >
                Promo
              </Link>
              <div className="border-t border-white/20 mx-3" />

              {/* Testimoni */}
              <Link
                to="/testimoni"
                onClick={closeMenu}
                className="flex items-center px-4 py-2.5 hover:bg-white/10 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-200 [animation-delay:200ms]"
                data-ocid="bottom_cta.menu.testimoni"
              >
                Testimoni
              </Link>
              <div className="border-t border-white/20 mx-3" />

              {/* Artikel */}
              <Link
                to="/blog"
                onClick={closeMenu}
                className="flex items-center px-4 py-2.5 hover:bg-white/10 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-200 [animation-delay:250ms]"
                data-ocid="bottom_cta.menu.artikel"
              >
                Artikel
              </Link>
              <div className="border-t border-white/20 mx-3" />

              {/* Kontak */}
              <Link
                to="/kontak"
                onClick={closeMenu}
                className="flex items-center px-4 py-2.5 hover:bg-white/10 transition-colors animate-in slide-in-from-bottom-2 fade-in duration-200 [animation-delay:300ms]"
                data-ocid="bottom_cta.menu.kontak"
              >
                Kontak
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
