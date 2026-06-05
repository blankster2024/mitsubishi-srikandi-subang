/**
 * Centralized API client for ICP canister calls.
 *
 * On Internet Computer, there are no HTTP REST endpoints with Bearer tokens.
 * Authentication is handled by the Internet Identity delegation chain embedded
 * in the actor's identity. This client provides:
 * 1. Pre-call validation that the actor has an authenticated (non-anonymous) identity
 * 2. Consistent error handling for authorization failures
 * 3. Token storage sync so session state persists across page refreshes
 *
 * Usage:
 *   const result = await apiClient.call(actor, () => actor.someMethod(args));
 */

import { tokenStorage } from "./tokenStorage";

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super("Sesi telah berakhir. Silakan login kembali.");
    this.name = "SessionExpiredError";
  }
}

/**
 * Wraps a canister call with authorization checks.
 * - Validates that the actor is not anonymous before making the call
 * - Catches authorization errors from the backend (Runtime.trap)
 * - Clears session on auth failure so user is prompted to re-login
 */
export async function protectedCall<T>(
  principalId: string | null | undefined,
  fn: () => Promise<T>,
): Promise<T> {
  // Check if we have an authenticated principal
  if (!principalId || principalId === "2vxsx-fae") {
    throw new AuthorizationError(
      "Anda belum login. Silakan login terlebih dahulu.",
    );
  }

  // Ensure session is still active in storage
  if (!tokenStorage.isSessionActive()) {
    throw new SessionExpiredError();
  }

  // Refresh expiry on every protected call to keep session alive
  tokenStorage.refreshSession();

  try {
    const result = await fn();
    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    // Detect authorization errors from Motoko Runtime.trap
    if (
      message.includes("Unauthorized") ||
      message.includes("unauthorized") ||
      message.includes("Only admin") ||
      message.includes("Only admins") ||
      message.includes("Only authenticated") ||
      message.includes("403") ||
      message.includes("401")
    ) {
      // Don't clear session for permission errors (user is logged in but lacks role)
      // Only clear for actual auth failures
      if (
        message.includes("not authenticated") ||
        message.includes("anonymous") ||
        message.includes("401")
      ) {
        tokenStorage.clearToken();
        throw new SessionExpiredError();
      }
      throw new AuthorizationError(message);
    }

    throw error;
  }
}

/**
 * Sync the current identity principal to localStorage.
 * Call this after successful login.
 */
export function syncAuthToken(principalId: string): void {
  if (principalId && principalId !== "2vxsx-fae") {
    tokenStorage.saveToken(principalId);
  }
}

/**
 * Clear auth token on logout.
 */
export function clearAuthToken(): void {
  tokenStorage.clearToken();
}
