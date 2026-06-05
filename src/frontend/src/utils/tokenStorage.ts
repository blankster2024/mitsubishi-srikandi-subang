/**
 * Token storage utility for persisting authentication state in localStorage.
 * On ICP, there is no JWT Bearer token - authentication is handled by the
 * Internet Identity delegation chain. This utility stores the principal ID
 * and session metadata to detect stale/anonymous sessions before making calls.
 */

const TOKEN_KEY = "auth_principal";
const SESSION_KEY = "auth_session_active";
const SESSION_EXPIRY_KEY = "auth_session_expiry";

export const tokenStorage = {
  /**
   * Save the authenticated principal ID to localStorage.
   */
  saveToken(principalId: string, expiryMs?: number): void {
    try {
      localStorage.setItem(TOKEN_KEY, principalId);
      localStorage.setItem(SESSION_KEY, "true");
      if (expiryMs) {
        localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + expiryMs));
      } else {
        // Default: 365 days for persistent admin session
        localStorage.setItem(
          SESSION_EXPIRY_KEY,
          String(Date.now() + 365 * 24 * 60 * 60 * 1000),
        );
      }
    } catch (_e) {
      // localStorage may be unavailable in some environments
    }
  },

  /**
   * Retrieve the stored principal ID from localStorage.
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (_e) {
      return null;
    }
  },

  /**
   * Check if a session is active and not expired.
   */
  isSessionActive(): boolean {
    try {
      const active = localStorage.getItem(SESSION_KEY);
      if (active !== "true") return false;

      const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
      if (expiry && Date.now() > Number(expiry)) {
        // Session expired - clean up
        tokenStorage.clearToken();
        return false;
      }
      return true;
    } catch (_e) {
      return false;
    }
  },

  /**
   * Clear all authentication data from localStorage.
   */
  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
    } catch (_e) {
      // localStorage may be unavailable
    }
  },

  /**
   * Refresh session expiry to 365 days from now.
   * Call after every successful backend interaction to keep session alive.
   */
  refreshSession(): void {
    try {
      const principal = tokenStorage.getToken();
      if (principal && tokenStorage.isSessionActive()) {
        localStorage.setItem(
          SESSION_EXPIRY_KEY,
          String(Date.now() + 365 * 24 * 60 * 60 * 1000),
        );
      }
    } catch (_e) {
      // localStorage may be unavailable
    }
  },

  /**
   * Check if the stored principal is anonymous (2vxsx-fae).
   */
  isAnonymous(): boolean {
    const principal = tokenStorage.getToken();
    return !principal || principal === "2vxsx-fae";
  },
};
