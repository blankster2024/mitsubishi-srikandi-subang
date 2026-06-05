import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TopPagesChartProps {
  data: Array<[string, bigint]> | undefined;
  isLoading: boolean;
}

export default function TopPagesChart({ data, isLoading }: TopPagesChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Halaman Paling Banyak Dikunjungi</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Halaman Paling Banyak Dikunjungi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Belum ada data page views
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert bigint data to chart format and get top 10
  const chartData = data
    .map(([url, count]) => {
      // Truncate long URLs for display
      let displayUrl = url;
      try {
        const urlObj = new URL(url);
        displayUrl = urlObj.pathname;
        if (displayUrl.length > 30) {
          displayUrl = `${displayUrl.substring(0, 27)}...`;
        }
      } catch {
        // If URL parsing fails, just truncate the string
        if (displayUrl.length > 30) {
          displayUrl = `${displayUrl.substring(0, 27)}...`;
        }
      }

      return {
        page: displayUrl,
        views: Number(count),
        fullUrl: url,
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Halaman Paling Banyak Dikunjungi</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="page"
              tick={{ fontSize: 11 }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value: number) => [value, "Views"]}
              labelFormatter={(label: string, payload: unknown[]) => {
                const first = payload?.[0] as
                  | { payload?: { fullUrl?: string } }
                  | undefined;
                if (first?.payload?.fullUrl) {
                  return first.payload.fullUrl;
                }
                return label;
              }}
            />
            <Bar
              dataKey="views"
              fill="hsl(var(--primary))"
              name="Page Views"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
