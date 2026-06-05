import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  detectBrowser,
  detectDeviceType,
  getClientIP,
  getOrCreateSessionId,
  isAdminRoute,
  isBot,
} from "../utils/visitorTracking";
import { useActor } from "./useActor";

/**
 * Legacy React hook for visitor tracking.
 * Note: This hook is deprecated. Primary tracking now happens in PublicLayout.
 * Kept for backward compatibility only.
 */
export function useVisitorTracking() {
  const location = useLocation();
  const { actor } = useActor();

  // biome-ignore lint/correctness/useExhaustiveDependencies: deprecated hook, intentional deps
  useEffect(() => {
    // This hook is now deprecated - tracking happens in PublicLayout
    // Keeping this empty to avoid duplicate tracking calls
    console.log(
      "[useVisitorTracking] Hook is deprecated, tracking handled by PublicLayout",
    );
  }, [location.pathname, actor]);
}
