import { useGetCommercialVehiclesByCategory } from "@/hooks/useCommercialVehicles";
import { useGetPublishedVehicles } from "@/hooks/useVehicles";
import { useGetWebsiteSettings } from "@/hooks/useWebsiteSettings";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bottomMenuOpen, setBottomMenuOpen] = useState(false);
  const [keluargaOpen, setKeluargaOpen] = useState(false);
  const [niagaOpen, setNiagaOpen] = useState(false);
  const [niagaLightOpen, setNiagaLightOpen] = useState(false);
  const [niagaMediumOpen, setNiagaMediumOpen] = useState(false);
  const [niagaTractorOpen, setNiagaTractorOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const bottomMenuRef = useRef<HTMLDivElement>(null);
  const { data: settings } = useGetWebsiteSettings();
  const location = useLocation();

  const { data: passengerVehicles = [] } = useGetPublishedVehicles();
  const { data: lightDutyVehicles = [] } =
    useGetCommercialVehiclesByCategory("light-duty");
  const { data: mediumDutyVehicles = [] } =
    useGetCommercialVehiclesByCategory("medium-duty");
  const { data: tractorHeadVehicles = [] } =
    useGetCommercialVehiclesByCategory("tractor-head");

  const siteName = settings?.siteName || "Mitsubishi Srikandi Subang";
  const isMobilNiagaPage = location.pathname.startsWith("/mobil-niaga");
  const niagaLogoUrl =
    "https://blob.caffeine.ai/v1/blob/?blob_hash=sha256%3A7455ea040ad4d31e3fd2a32b0dce2660ae3ace4a31dc40edfa6f4d05ce419a74&owner_id=bskla-eiaaa-aaaan-q4qba-cai&project_id=019c76c5-c8d9-757e-ad55-3b3449510206";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (
        bottomMenuRef.current &&
        !bottomMenuRef.current.contains(event.target as Node)
      ) {
        setBottomMenuOpen(false);
      }
    };
    if (mobileMenuOpen || bottomMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen, bottomMenuOpen]);

  const closeBottomMenu = () => {
    setBottomMenuOpen(false);
    setKeluargaOpen(false);
    setNiagaOpen(false);
    setNiagaLightOpen(false);
    setNiagaMediumOpen(false);
    setNiagaTractorOpen(false);
  };

  const menuItems = [
    { label: "Beranda", href: "/" },
    { label: "Mobil Keluarga", href: "/mobil-keluarga" },
    { label: "Mobil Niaga", href: "/mobil-niaga" },
    { label: "Promo", href: "/promo" },
    { label: "Testimoni", href: "/testimoni" },
    { label: "Blog", href: "/blog" },
    { label: "Hubungi Kami", href: "/kontak" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#262729] shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Site Title */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              {isMobilNiagaPage ? (
                <img
                  src={niagaLogoUrl}
                  alt="Logo Mobil Niaga"
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <img
                  src="/assets/logomitsubishi-1.png"
                  alt="Mitsubishi Srikandi Subang Logo"
                  className="h-10"
                />
              )}
              <span className="text-white font-bold text-base md:text-lg">
                {siteName}
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-white hover:text-[#C90010] font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile hamburger (top bar) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden bg-[#262729] border-t border-gray-700 animate-in slide-in-from-top absolute left-0 right-0 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block py-2 text-white hover:text-[#C90010] font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── Bottom Bar (mobile only) ───────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#262729] border-t border-gray-700 flex">
        {/* Beranda */}
        <Link
          to="/"
          className="flex-1 flex flex-col items-center justify-center py-2 text-white text-[10px] gap-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 22V12h6v10"
            />
          </svg>
          Beranda
        </Link>

        {/* Keluarga */}
        <Link
          to="/mobil-keluarga"
          className="flex-1 flex flex-col items-center justify-center py-2 text-white text-[10px] gap-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
          Keluarga
        </Link>

        {/* Menu (accordion dropdown) */}
        <div
          className="flex-1 flex flex-col items-center justify-center relative"
          ref={bottomMenuRef}
        >
          <button
            type="button"
            data-ocid="bottom_bar.menu_button"
            onClick={() => setBottomMenuOpen((v) => !v)}
            className="flex flex-col items-center justify-center py-2 text-white text-[10px] gap-0.5 w-full"
          >
            {bottomMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
            Menu
          </button>

          {/* Dropdown — opens upward, width = button width */}
          {bottomMenuOpen && (
            <div
              data-ocid="bottom_bar.dropdown_menu"
              className="absolute bottom-full mb-1 left-0 right-0 bg-[#0357A1] text-white rounded-t-lg shadow-2xl overflow-y-auto max-h-[70vh] text-xs"
            >
              {/* Beranda */}
              <Link
                to="/"
                onClick={closeBottomMenu}
                className="flex items-center px-3 py-2.5 hover:bg-[#024a8c] transition-colors"
                data-ocid="bottom_bar.menu.beranda"
              >
                Beranda
              </Link>
              <div className="border-t border-[#1a6abf] mx-2" />

              {/* Mobil Keluarga */}
              <button
                type="button"
                onClick={() => setKeluargaOpen((v) => !v)}
                className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-[#024a8c] transition-colors"
                data-ocid="bottom_bar.menu.keluarga_toggle"
              >
                <span>Mobil Keluarga</span>
                {keluargaOpen ? (
                  <ChevronDown className="w-3 h-3 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 shrink-0" />
                )}
              </button>
              {keluargaOpen && (
                <div className="bg-[#024a8c]">
                  {passengerVehicles.length === 0 && (
                    <p className="px-5 py-2 text-[#93c5fd] border-t border-[#1a6abf]">
                      Memuat...
                    </p>
                  )}
                  {passengerVehicles.map((v) => (
                    <a
                      key={v.slug}
                      href={`/mobil-keluarga/${v.slug}`}
                      onClick={closeBottomMenu}
                      className="flex items-center gap-1 px-5 py-2 hover:bg-[#013d7a] transition-colors border-t border-[#1a6abf]"
                      data-ocid="bottom_bar.menu.keluarga_item"
                    >
                      <span className="text-[#93c5fd] mr-1">&rsaquo;</span>
                      <span className="truncate">{v.vehicleName}</span>
                    </a>
                  ))}
                </div>
              )}
              <div className="border-t border-[#1a6abf] mx-2" />

              {/* Mobil Niaga */}
              <button
                type="button"
                onClick={() => setNiagaOpen((v) => !v)}
                className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-[#024a8c] transition-colors"
                data-ocid="bottom_bar.menu.niaga_toggle"
              >
                <span>Mobil Niaga</span>
                {niagaOpen ? (
                  <ChevronDown className="w-3 h-3 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 shrink-0" />
                )}
              </button>
              {niagaOpen && (
                <div className="bg-[#024a8c]">
                  {/* Light Duty */}
                  <button
                    type="button"
                    onClick={() => setNiagaLightOpen((v) => !v)}
                    className="flex items-center justify-between w-full px-5 py-2 hover:bg-[#013d7a] transition-colors border-t border-[#1a6abf]"
                    data-ocid="bottom_bar.menu.niaga_light_toggle"
                  >
                    <span className="text-[#93c5fd]">Light Duty</span>
                    {niagaLightOpen ? (
                      <ChevronDown className="w-3 h-3 shrink-0 text-[#93c5fd]" />
                    ) : (
                      <ChevronRight className="w-3 h-3 shrink-0 text-[#93c5fd]" />
                    )}
                  </button>
                  {niagaLightOpen &&
                    lightDutyVehicles.map((v) => (
                      <a
                        key={v.slug}
                        href={`/mobil-niaga/light-duty/${v.slug}`}
                        onClick={closeBottomMenu}
                        className="flex items-center gap-1 px-8 py-1.5 hover:bg-[#012d5e] transition-colors border-t border-[#1a6abf]"
                        data-ocid="bottom_bar.menu.niaga_light_item"
                      >
                        <span className="text-[#60a5fa] mr-1">&rsaquo;</span>
                        <span className="truncate">{v.name}</span>
                      </a>
                    ))}

                  {/* Medium Duty */}
                  <button
                    type="button"
                    onClick={() => setNiagaMediumOpen((v) => !v)}
                    className="flex items-center justify-between w-full px-5 py-2 hover:bg-[#013d7a] transition-colors border-t border-[#1a6abf]"
                    data-ocid="bottom_bar.menu.niaga_medium_toggle"
                  >
                    <span className="text-[#93c5fd]">Medium Duty</span>
                    {niagaMediumOpen ? (
                      <ChevronDown className="w-3 h-3 shrink-0 text-[#93c5fd]" />
                    ) : (
                      <ChevronRight className="w-3 h-3 shrink-0 text-[#93c5fd]" />
                    )}
                  </button>
                  {niagaMediumOpen &&
                    mediumDutyVehicles.map((v) => (
                      <a
                        key={v.slug}
                        href={`/mobil-niaga/medium-duty/${v.slug}`}
                        onClick={closeBottomMenu}
                        className="flex items-center gap-1 px-8 py-1.5 hover:bg-[#012d5e] transition-colors border-t border-[#1a6abf]"
                        data-ocid="bottom_bar.menu.niaga_medium_item"
                      >
                        <span className="text-[#60a5fa] mr-1">&rsaquo;</span>
                        <span className="truncate">{v.name}</span>
                      </a>
                    ))}

                  {/* Tractor Head */}
                  <button
                    type="button"
                    onClick={() => setNiagaTractorOpen((v) => !v)}
                    className="flex items-center justify-between w-full px-5 py-2 hover:bg-[#013d7a] transition-colors border-t border-[#1a6abf]"
                    data-ocid="bottom_bar.menu.niaga_tractor_toggle"
                  >
                    <span className="text-[#93c5fd]">Tractor Head</span>
                    {niagaTractorOpen ? (
                      <ChevronDown className="w-3 h-3 shrink-0 text-[#93c5fd]" />
                    ) : (
                      <ChevronRight className="w-3 h-3 shrink-0 text-[#93c5fd]" />
                    )}
                  </button>
                  {niagaTractorOpen &&
                    tractorHeadVehicles.map((v) => (
                      <a
                        key={v.slug}
                        href={`/mobil-niaga/tractor-head/${v.slug}`}
                        onClick={closeBottomMenu}
                        className="flex items-center gap-1 px-8 py-1.5 hover:bg-[#012d5e] transition-colors border-t border-[#1a6abf]"
                        data-ocid="bottom_bar.menu.niaga_tractor_item"
                      >
                        <span className="text-[#60a5fa] mr-1">&rsaquo;</span>
                        <span className="truncate">{v.name}</span>
                      </a>
                    ))}
                </div>
              )}
              <div className="border-t border-[#1a6abf] mx-2" />

              {/* Promo */}
              <Link
                to="/promo"
                onClick={closeBottomMenu}
                className="flex items-center px-3 py-2.5 hover:bg-[#024a8c] transition-colors"
                data-ocid="bottom_bar.menu.promo"
              >
                Promo
              </Link>
              <div className="border-t border-[#1a6abf] mx-2" />

              {/* Testimoni */}
              <Link
                to="/testimoni"
                onClick={closeBottomMenu}
                className="flex items-center px-3 py-2.5 hover:bg-[#024a8c] transition-colors"
                data-ocid="bottom_bar.menu.testimoni"
              >
                Testimoni
              </Link>
              <div className="border-t border-[#1a6abf] mx-2" />

              {/* Artikel */}
              <Link
                to="/blog"
                onClick={closeBottomMenu}
                className="flex items-center px-3 py-2.5 hover:bg-[#024a8c] transition-colors"
                data-ocid="bottom_bar.menu.artikel"
              >
                Artikel
              </Link>
              <div className="border-t border-[#1a6abf] mx-2" />

              {/* Kontak */}
              <Link
                to="/kontak"
                onClick={closeBottomMenu}
                className="flex items-center px-3 py-2.5 hover:bg-[#024a8c] transition-colors"
                data-ocid="bottom_bar.menu.kontak"
              >
                Kontak
              </Link>
            </div>
          )}
        </div>

        {/* Promo */}
        <Link
          to="/promo"
          className="flex-1 flex flex-col items-center justify-center py-2 text-white text-[10px] gap-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Promo
        </Link>

        {/* Kontak */}
        <Link
          to="/kontak"
          className="flex-1 flex flex-col items-center justify-center py-2 text-white text-[10px] gap-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Kontak
        </Link>
      </div>
    </>
  );
}
