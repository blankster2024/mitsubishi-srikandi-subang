import { useNavigate } from "@tanstack/react-router";
import type React from "react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { clearAuthToken, syncAuthToken } from "../utils/apiClient";
import { tokenStorage } from "../utils/tokenStorage";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard validates Internet Identity delegation before rendering admin pages.
 * - Redirects to /login if identity is missing or anonymous
 * - Syncs principal to localStorage for persistent session tracking
 * - Clears stale tokens on logout/expiry
 * - Shows brief loading state to allow session restoration on refresh
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const [sessionCheckDone, setSessionCheckDone] = useState(false);

  const principalId = identity?.getPrincipal().toString();
  const isAnonymous = !principalId || principalId === "2vxsx-fae";

  useEffect(() => {
    if (isInitializing) return;

    if (!identity || isAnonymous) {
      // Check if we have a stored session - give it a moment to restore
      const storedPrincipal = tokenStorage.getToken();
      const isSessionActive = tokenStorage.isSessionActive();

      if (storedPrincipal && isSessionActive && !sessionCheckDone) {
        // Session exists in localStorage, wait briefly for identity to restore
        const timer = setTimeout(() => {
          setSessionCheckDone(true);
        }, 2000);
        return () => clearTimeout(timer);
      }

      // No session or check already done - redirect
      clearAuthToken();
      navigate({ to: "/login" });
      return;
    }

    // Identity is valid
    setSessionCheckDone(true);

    try {
      const delegation = (identity as any)._delegation;
      if (delegation?.delegations?.length > 0) {
        const expiry = delegation.delegations[0].delegation.expiration;
        if (expiry) {
          // expiry is in nanoseconds (BigInt)
          const expiryMs = Number(expiry / BigInt(1_000_000));
          if (Date.now() > expiryMs) {
            clearAuthToken();
            navigate({ to: "/login" });
            return;
          }
          syncAuthToken(principalId);
          // Refresh session expiry now that delegation is confirmed valid
          tokenStorage.refreshSession();
        } else {
          syncAuthToken(principalId);
          tokenStorage.refreshSession();
        }
      } else {
        syncAuthToken(principalId);
        tokenStorage.refreshSession();
      }
    } catch {
      // If we can't check delegation, still sync if identity exists
      syncAuthToken(principalId);
      tokenStorage.refreshSession();
    }
  }, [
    identity,
    isAnonymous,
    isInitializing,
    navigate,
    principalId,
    sessionCheckDone,
  ]);

  // Show loading while identity is initializing or session is being restored
  if (
    isInitializing ||
    (!identity && !sessionCheckDone && tokenStorage.isSessionActive())
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">
            {isInitializing ? "Memuat sesi..." : "Memulai ulang sesi..."}
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!identity || isAnonymous) {
    return null;
  }

  return <>{children}</>;
}
