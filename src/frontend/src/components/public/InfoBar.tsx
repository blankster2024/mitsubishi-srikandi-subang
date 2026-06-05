import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function InfoBar() {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      mobileInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const navigateSearch = () => {
    const q = searchQuery.trim();
    if (q) navigate({ to: "/search", search: { q } });
  };

  return (
    <div className="bg-[#E5E7EB] py-2">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          display: inline-block;
          white-space: nowrap;
        }
      `}</style>
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        {/* Running Text */}
        <div className="flex-1 overflow-hidden">
          <span className="animate-marquee text-sm font-medium text-gray-700 whitespace-nowrap">
            Selamat Datang di Website{" "}
            <span className="font-bold text-[#CC0000]">
              MITSUBISHI SRIKANDI SUBANG
            </span>{" "}
            - Dealer Resmi Mobil Mitsubishi di Kota Subang
          </span>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex items-center gap-2 relative flex-shrink-0">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CC0000] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigateSearch()}
            placeholder="Cari mobil, promo, artikel..."
            className="pl-8 pr-4 py-1.5 border border-gray-300 rounded-sm text-sm w-64 focus:outline-none focus:border-gray-500 bg-white"
            data-ocid="infobar.search_input"
          />
        </div>

        {/* Mobile Search */}
        <div className="flex md:hidden items-center flex-shrink-0">
          {!isSearchOpen ? (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buka pencarian"
              data-ocid="infobar.search_toggle"
            >
              <Search className="w-5 h-5 text-[#CC0000]" />
            </button>
          ) : (
            <div className="flex items-center gap-2 transition-all duration-300">
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && navigateSearch()}
                onBlur={() => {
                  if (!searchQuery) setIsSearchOpen(false);
                }}
                placeholder="Cari mobil, promo, artikel..."
                className="pl-3 pr-4 py-1 md:py-1.5 border border-gray-300 rounded-sm text-xs md:text-sm w-48 focus:outline-none bg-white"
                data-ocid="infobar.search_input_mobile"
              />
              <button type="button" onClick={navigateSearch} aria-label="Cari">
                <Search className="w-4 h-4 text-gray-500 cursor-pointer" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
