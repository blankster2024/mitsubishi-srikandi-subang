import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

interface AdminStats {
  totalVehicles: number;
  totalPassengerVehicles: number;
  totalCommercialVehicles: number;
  totalContacts: number;
  totalLeads: number;
  totalBlogPosts: number;
  totalMediaAssets: number;
  totalVisitors: number;
  dailyVisitors: number;
}

const ZERO_STATS: AdminStats = {
  totalVehicles: 0,
  totalPassengerVehicles: 0,
  totalCommercialVehicles: 0,
  totalContacts: 0,
  totalLeads: 0,
  totalBlogPosts: 0,
  totalMediaAssets: 0,
  totalVisitors: 0,
  dailyVisitors: 0,
};

// Cache last known stats for failsafe
let _lastKnownAdminStats: AdminStats = ZERO_STATS;

export function useGetAdminStats() {
  const { actor } = useActor();

  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) return _lastKnownAdminStats;
      try {
        // Run all fetches in parallel for performance
        const [visitorStats, mediaAssets] = await Promise.all([
          actor.getPublicVisitorStats().catch(() => null),
          actor.getAllMediaAssets().catch(() => []),
        ]);

        const result: AdminStats = {
          ...ZERO_STATS,
          totalMediaAssets: Array.isArray(mediaAssets) ? mediaAssets.length : 0,
          totalVisitors: visitorStats
            ? Number(visitorStats.totalVisitors)
            : _lastKnownAdminStats.totalVisitors,
          dailyVisitors: visitorStats
            ? Number(visitorStats.visitorsToday)
            : _lastKnownAdminStats.dailyVisitors,
        };
        _lastKnownAdminStats = result;
        return result;
      } catch (err) {
        console.warn("[useGetAdminStats] Failed to fetch:", err);
        return _lastKnownAdminStats;
      }
    },
    // Removed !isFetching guard — actor readiness is sufficient
    enabled: !!actor,
    refetchInterval: 30000,
    staleTime: 25000,
  });
}

// Export alias for backward compatibility
export const useAdminStats = useGetAdminStats;
