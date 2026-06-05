import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface VisitorTrendChartProps {
  data: Array<[bigint, bigint]> | undefined;
  isLoading: boolean;
}

export default function VisitorTrendChart({
  data,
  isLoading,
}: VisitorTrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tren Pengunjung 30 Hari Terakhir</CardTitle>
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
          <CardTitle>Tren Pengunjung 30 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Belum ada data pengunjung
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert bigint data to chart format
  const chartData = data
    .map(([timestamp, count]) => ({
      date: new Date(Number(timestamp) / 1_000_000).toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "short",
        },
      ),
      visitors: Number(count),
      timestamp: Number(timestamp),
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-30); // Last 30 days

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Pengunjung 30 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
              name="Pengunjung"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
