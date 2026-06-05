import { useQuery } from "@tanstack/react-query";
import type { VisitorStats } from "../backend";
import { useActor } from "./useActor";

const ZERO_STATS: VisitorStats = {
  visitorsThisWeek: BigInt(0),
  visitorsYesterday: BigInt(0),
  visitorsThisYear: BigInt(0),
  onlineNow: BigInt(0),
  totalVisitors: BigInt(0),
  visitorsToday: BigInt(0),
  pageViewsToday: BigInt(0),
  visitorsThisMonth: BigInt(0),
};

// Cache last known good stats for failsafe protection
let _lastKnownStats: VisitorStats = ZERO_STATS;

export function useGetVisitorStats(options?: { refetchInterval?: number }) {
  const { actor } = useActor();

  return useQuery<VisitorStats>({
    queryKey: ["visitorStats"],
    queryFn: async () => {
      if (!actor) return _lastKnownStats;
      try {
        // Use public endpoint — works for both anonymous and authenticated actors
        const stats = await actor.getPublicVisitorStats();
        _lastKnownStats = stats;
        return stats;
      } catch (err) {
        console.warn("[useGetVisitorStats] Failed to fetch stats:", err);
        // Failsafe: return last known values instead of zeros
        return _lastKnownStats;
      }
    },
    enabled: !!actor,
    refetchInterval: options?.refetchInterval ?? 30000,
    // Keep stale data visible during refetch — never flash zeros
    staleTime: 25000,
  });
}

// Cache last known trend data
let _lastKnownTrend: Array<[bigint, bigint]> = [];

export function useGetVisitorTrend() {
  const { actor } = useActor();

  return useQuery<Array<[bigint, bigint]>>({
    queryKey: ["visitorTrend"],
    queryFn: async () => {
      if (!actor) return _lastKnownTrend;
      try {
        const trend = await actor.getDailyVisitorTrend();
        _lastKnownTrend = trend;
        return trend;
      } catch (err) {
        console.warn("[useGetVisitorTrend] Failed to fetch trend:", err);
        return _lastKnownTrend;
      }
    },
    enabled: !!actor,
    refetchInterval: 30000,
    staleTime: 25000,
  });
}

// Cache last known page views
let _lastKnownPageViews: Array<[string, bigint]> = [];

export function useGetPageViews() {
  const { actor } = useActor();

  return useQuery<Array<[string, bigint]>>({
    queryKey: ["pageViews"],
    queryFn: async () => {
      if (!actor) return _lastKnownPageViews;
      try {
        const pages = await actor.getTopPageViews();
        _lastKnownPageViews = pages;
        return pages;
      } catch (err) {
        console.warn("[useGetPageViews] Failed to fetch page views:", err);
        return _lastKnownPageViews;
      }
    },
    enabled: !!actor,
    refetchInterval: 30000,
    staleTime: 25000,
  });
}
