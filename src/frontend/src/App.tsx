import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import AuthGuard from "./components/AuthGuard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ActorProvider } from "./contexts/ActorContext";
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import LoginPage from "./pages/LoginPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import BlogCommentsPage from "./pages/admin/BlogCommentsPage";
import BlogPostEditPage from "./pages/admin/BlogPostEditPage";
import BlogPostNewPage from "./pages/admin/BlogPostNewPage";
import BlogPostsPage from "./pages/admin/BlogPostsPage";
import CommercialVehiclesPage from "./pages/admin/CommercialVehiclesPage";
import CreditSimulationsPage from "./pages/admin/CreditSimulationsPage";
import DashboardPage from "./pages/admin/DashboardPage";
import LeadsPage from "./pages/admin/LeadsPage";
import MediaManagerPage from "./pages/admin/MediaManagerPage";
import PassengerVehiclesPage from "./pages/admin/PassengerVehiclesPage";
import PromosPage from "./pages/admin/PromosPage";
import TestimonialsPage from "./pages/admin/TestimonialsPage";
import VisitorStatsPage from "./pages/admin/VisitorStatsPage";
import WebsiteSettingsPage from "./pages/admin/WebsiteSettingsPage";
import BerandaPage from "./pages/public/BerandaPage";
import BlogDetailPage from "./pages/public/BlogDetailPage";
import BlogListPage from "./pages/public/BlogListPage";
import KontakPage from "./pages/public/KontakPage";
import MobilKeluargaDetailPage from "./pages/public/MobilKeluargaDetailPage";
import MobilKeluargaPage from "./pages/public/MobilKeluargaPage";
import MobilNiagaCategoryPage from "./pages/public/MobilNiagaCategoryPage";
import MobilNiagaDetailPage from "./pages/public/MobilNiagaDetailPage";
import MobilNiagaPage from "./pages/public/MobilNiagaPage";
import PromoDetailPage from "./pages/public/PromoDetailPage";
import PromoPage from "./pages/public/PromoPage";
import SearchPage from "./pages/public/SearchPage";
import SimulasiKreditPage from "./pages/public/SimulasiKreditPage";
import TestimoniPage from "./pages/public/TestimoniPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      retryDelay: 1000,
      throwOnError: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      throwOnError: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Outlet />
      <Toaster />
    </ThemeProvider>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// Admin routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AuthGuard>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </AuthGuard>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const adminPassengerVehiclesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/mobil-keluarga",
  component: PassengerVehiclesPage,
});

const adminCommercialVehiclesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/mobil-niaga",
  component: CommercialVehiclesPage,
});

const adminPromosRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/promo",
  component: PromosPage,
});

const adminTestimonialsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/testimoni",
  component: TestimonialsPage,
});

const adminBlogRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/blog",
  component: BlogPostsPage,
});

const adminBlogNewRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/blog/new",
  component: BlogPostNewPage,
});

const adminBlogEditRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/blog/edit/$id",
  component: BlogPostEditPage,
});

const adminBlogCommentsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/blog/comments",
  component: BlogCommentsPage,
});

const mediaRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/media",
  component: MediaManagerPage,
});

const leadsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/leads",
  component: LeadsPage,
});

const adminCreditSimulationsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/simulasi-kredit",
  component: CreditSimulationsPage,
});

const visitorStatsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/statistik",
  component: VisitorStatsPage,
});

const websiteSettingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/pengaturan",
  component: WebsiteSettingsPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/admin-users",
  component: AdminUsersPage,
});

// Public routes
const berandaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <PublicLayout>
      <BerandaPage />
    </PublicLayout>
  ),
});

const mobilKeluargaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mobil-keluarga",
  component: () => (
    <PublicLayout>
      <MobilKeluargaPage />
    </PublicLayout>
  ),
});

const mobilKeluargaDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mobil-keluarga/$slug",
  component: () => (
    <PublicLayout>
      <MobilKeluargaDetailPage />
    </PublicLayout>
  ),
});

const mobilNiagaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mobil-niaga",
  component: () => (
    <PublicLayout>
      <MobilNiagaPage />
    </PublicLayout>
  ),
});

const mobilNiagaCategoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mobil-niaga/$kategori",
  component: () => (
    <PublicLayout>
      <MobilNiagaCategoryPage />
    </PublicLayout>
  ),
});

const mobilNiagaDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mobil-niaga/$kategori/$slug",
  component: () => (
    <PublicLayout>
      <MobilNiagaDetailPage />
    </PublicLayout>
  ),
});

const promoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/promo",
  component: () => (
    <PublicLayout>
      <PromoPage />
    </PublicLayout>
  ),
});

const promoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/promo/$slug",
  component: () => (
    <PublicLayout>
      <PromoDetailPage />
    </PublicLayout>
  ),
});

const testimoniRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/testimoni",
  component: () => (
    <PublicLayout>
      <TestimoniPage />
    </PublicLayout>
  ),
});

const blogListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: () => (
    <PublicLayout>
      <BlogListPage />
    </PublicLayout>
  ),
});

const blogDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$slug",
  component: () => (
    <PublicLayout>
      <BlogDetailPage />
    </PublicLayout>
  ),
});

const kontakRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kontak",
  component: () => (
    <PublicLayout>
      <KontakPage />
    </PublicLayout>
  ),
});

const simulasiKreditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/simulasi-kredit",
  component: () => (
    <PublicLayout>
      <SimulasiKreditPage />
    </PublicLayout>
  ),
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) ?? "",
  }),
  component: () => (
    <PublicLayout>
      <SearchPage />
    </PublicLayout>
  ),
});

const routeTree = rootRoute.addChildren([
  berandaRoute,
  loginRoute,
  mobilKeluargaRoute,
  mobilKeluargaDetailRoute,
  mobilNiagaRoute,
  mobilNiagaCategoryRoute,
  mobilNiagaDetailRoute,
  promoRoute,
  promoDetailRoute,
  testimoniRoute,
  blogListRoute,
  blogDetailRoute,
  kontakRoute,
  simulasiKreditRoute,
  searchRoute,
  adminRoute.addChildren([
    dashboardRoute,
    adminPassengerVehiclesRoute,
    adminCommercialVehiclesRoute,
    adminPromosRoute,
    adminTestimonialsRoute,
    adminBlogRoute,
    adminBlogNewRoute,
    adminBlogEditRoute,
    adminBlogCommentsRoute,
    mediaRoute,
    leadsRoute,
    adminCreditSimulationsRoute,
    visitorStatsRoute,
    websiteSettingsRoute,
    adminUsersRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ActorProvider>
          <RouterProvider router={router} />
        </ActorProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
