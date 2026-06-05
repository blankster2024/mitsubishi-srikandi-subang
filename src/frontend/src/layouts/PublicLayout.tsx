import { ErrorBoundary } from "@/components/ErrorBoundary";
import BottomCTABar from "@/components/public/BottomCTABar";
import Footer from "@/components/public/Footer";
import Navbar from "@/components/public/Navbar";
import { useActor } from "@/hooks/useActor";
import { useGetWebsiteSettings } from "@/hooks/useWebsiteSettings";
import {
  detectBrowser,
  detectDeviceType,
  getOrCreateSessionId,
  isAdminRoute,
  isBot,
} from "@/utils/visitorTracking";
import { useLocation } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";

const SITE_FALLBACK = "Mitsubishi Srikandi Subang";

function getPageTitle(pathname: string, siteName: string): string {
  const name = siteName || SITE_FALLBACK;

  if (pathname === "/") return name;
  if (pathname.startsWith("/mobil-keluarga/")) {
    // Dynamic detail pages set their own title — skip overriding here
    return "";
  }
  if (pathname === "/mobil-keluarga") return `Mobil Keluarga — ${name}`;
  if (pathname === "/mobil-niaga") return `Mobil Niaga — ${name}`;
  if (pathname === "/promo") return `Promo — ${name}`;
  if (pathname === "/testimoni") return `Testimoni — ${name}`;
  if (pathname === "/kontak") return `Kontak — ${name}`;
  if (pathname === "/blog" || pathname === "/artikel")
    return `Artikel — ${name}`;
  if (pathname === "/simulasi-kredit") return `Simulasi Kredit — ${name}`;
  return name;
}

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { actor } = useActor();
  const { data: settings } = useGetWebsiteSettings();

  // Set document.title based on current route + site name from settings
  useEffect(() => {
    const siteName = settings?.siteName || SITE_FALLBACK;
    const title = getPageTitle(pathname, siteName);
    // Only override if we have a title (detail pages set their own title)
    if (title) {
      document.title = title;
    }
  }, [pathname, settings]);

  // Track visitor on every page navigation
  // biome-ignore lint/correctness/useExhaustiveDependencies: location.pathname triggers re-run intentionally
  useEffect(() => {
    if (!actor) return;
    if (isAdminRoute(pathname)) return;
    if (isBot()) return;

    // Session management with 30-min expiry handled inside getOrCreateSessionId
    const sessionId = getOrCreateSessionId();
    const ipAddress = "client-detected";
    const userAgent = navigator.userAgent;
    // Use pathname as the page URL for clean per-page tracking
    const pageUrl = pathname;
    const referrer = document.referrer || "direct";
    const deviceType = detectDeviceType();
    const browser = detectBrowser();

    actor
      .trackVisitor(
        sessionId,
        ipAddress,
        userAgent,
        pageUrl,
        referrer,
        deviceType,
        browser,
      )
      .catch(() => {
        // silently ignore tracking errors — never break the UI
      });
  }, [location.pathname, pathname, actor]);

  return (
    <div className="min-h-screen flex flex-col pb-[50px]">
      <Navbar />
      <ErrorBoundary>
        <main className="flex-1">{children}</main>
      </ErrorBoundary>
      <div className="w-full h-1 bg-[#CC0000]" />
      <Footer />
      <BottomCTABar />
    </div>
  );
}
