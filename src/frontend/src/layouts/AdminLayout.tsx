import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Calculator,
  Car,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Settings,
  Tag,
  Truck,
  Users,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/mobil-keluarga", label: "Mobil Keluarga", icon: Car },
  { path: "/admin/mobil-niaga", label: "Mobil Niaga", icon: Truck },
  { path: "/admin/promo", label: "Promo", icon: Tag },
  { path: "/admin/testimoni", label: "Testimoni", icon: MessageSquare },
  { path: "/admin/blog", label: "Semua Post Blog", icon: FileText },
  { path: "/admin/blog/comments", label: "Komentar Blog", icon: MessageCircle },
  { path: "/admin/media", label: "Media Manager", icon: Image },
  { path: "/admin/leads", label: "Leads / Kontak Masuk", icon: Mail },
  {
    path: "/admin/simulasi-kredit",
    label: "Simulasi Kredit",
    icon: Calculator,
  },
  { path: "/admin/statistik", label: "Statistik Pengunjung", icon: BarChart3 },
  { path: "/admin/pengaturan", label: "Pengaturan Website", icon: Settings },
  { path: "/admin/admin-users", label: "Admin Users", icon: Users },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect viewport size and set initial state
  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsCollapsed(mobile);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Auto-collapse on route change (mobile only)
  // biome-ignore lint/correctness/useExhaustiveDependencies: location.pathname triggers re-run intentionally
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  // Click outside to collapse (mobile only)
  useEffect(() => {
    if (!isMobile || isCollapsed) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isCollapsed]);

  const handleLogout = async () => {
    queryClient.clear();
    await clear();
    navigate({ to: "/login" });
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
        style={{ backgroundColor: "#262729" }}
      >
        {/* Header with toggle button */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ backgroundColor: "#CC0000" }}
        >
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">
                Mitsubishi Srikandi
              </h1>
              <p className="text-xs text-white/70">Admin Panel</p>
            </div>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-white/10 transition-colors text-white"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </button>
        </div>

        <Separator className="bg-white/10" />

        <ScrollArea className="h-[calc(100vh-180px)]">
          <nav className="p-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // For /admin/blog/comments use exact match; for /admin/blog use startsWith (covers new/edit)
              const isActive =
                item.path === "/admin/blog/comments"
                  ? location.pathname === item.path
                  : item.path === "/admin/blog"
                    ? location.pathname === item.path ||
                      (location.pathname.startsWith("/admin/blog") &&
                        !location.pathname.startsWith("/admin/blog/comments"))
                    : location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-[#CC0000] text-white"
                      : "text-white/90 hover:bg-white/10"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  style={{
                    minHeight: "44px",
                    minWidth: "44px",
                  }}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap overflow-hidden transition-opacity duration-200">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div
          className={`absolute bottom-0 p-3 border-t transition-all duration-300 ${
            isCollapsed ? "w-16" : "w-64"
          }`}
          style={{
            backgroundColor: "#262729",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`w-full bg-transparent border-[#CC0000]/60 text-[#CC0000] hover:bg-[#CC0000] hover:text-white hover:border-[#CC0000] transition-all ${
              isCollapsed ? "px-2" : ""
            }`}
            style={{ minHeight: "44px" }}
          >
            <LogOut className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"}`} />
            {!isCollapsed && "Keluar"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white">
        <div className="container mx-auto p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
