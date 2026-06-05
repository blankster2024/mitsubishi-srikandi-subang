import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Calendar, Eye, TrendingUp, Users } from "lucide-react";
import TopPagesChart from "../../components/admin/TopPagesChart";
import VisitorTrendChart from "../../components/admin/VisitorTrendChart";
import {
  useGetPageViews,
  useGetVisitorStats,
  useGetVisitorTrend,
} from "../../hooks/useVisitorStats";

export default function VisitorStatsPage() {
  // Auto-refresh every 30 seconds
  const { data: visitorStats, isLoading } = useGetVisitorStats({
    refetchInterval: 30000,
  });
  const { data: trendData, isLoading: trendLoading } = useGetVisitorTrend();
  const { data: pageViewsData, isLoading: pageViewsLoading } =
    useGetPageViews();

  const formatNumber = (num: bigint | undefined): string => {
    if (num === undefined) return "0";
    return Number(num).toLocaleString("id-ID");
  };

  const stats = [
    {
      title: "Total Pengunjung",
      value: visitorStats?.totalVisitors,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Pengunjung Hari Ini",
      value: visitorStats?.visitorsToday,
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Pengunjung Kemarin",
      value: visitorStats?.visitorsYesterday,
      icon: Calendar,
      color: "text-orange-600",
    },
    {
      title: "Pengunjung Mingguan",
      value: visitorStats?.visitorsThisWeek,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Pengunjung Bulanan",
      value: visitorStats?.visitorsThisMonth,
      icon: TrendingUp,
      color: "text-pink-600",
    },
    {
      title: "Pengunjung Tahunan",
      value: visitorStats?.visitorsThisYear,
      icon: TrendingUp,
      color: "text-indigo-600",
    },
    {
      title: "Online Sekarang",
      value: visitorStats?.onlineNow,
      icon: Activity,
      color: "text-emerald-600",
    },
    {
      title: "Page Views Hari Ini",
      value: visitorStats?.pageViewsToday,
      icon: Eye,
      color: "text-cyan-600",
    },
  ];

  return (
    <div className="space-y-6" data-ocid="visitor_stats.page">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Statistik Pengunjung
        </h1>
        <p className="text-muted-foreground">
          Pantau aktivitas pengunjung website secara real-time (auto-refresh
          setiap 30 detik)
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        data-ocid="visitor_stats.list"
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} data-ocid={`visitor_stats.item.${idx + 1}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton
                    className="h-8 w-20"
                    data-ocid="visitor_stats.loading_state"
                  />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatNumber(stat.value)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitorTrendChart data={trendData} isLoading={trendLoading} />
        <TopPagesChart data={pageViewsData} isLoading={pageViewsLoading} />
      </div>
    </div>
  );
}
