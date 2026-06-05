import type { Identity } from "@dfinity/agent";
import { DelegationIdentity, isDelegationValid } from "@icp-sdk/core/identity";
import { VALIDATION } from "../constants/translations";

export function validateRequired(value: string): string | null {
  return value.trim() ? null : VALIDATION.required;
}

export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return VALIDATION.required;
  if (!emailRegex.test(email)) return VALIDATION.invalidEmail;
  return null;
}

export function validatePhone(phone: string): string | null {
  const phoneRegex = /^[0-9+\-\s()]+$/;
  if (!phone.trim()) return VALIDATION.required;
  if (!phoneRegex.test(phone)) return VALIDATION.invalidPhone;
  return null;
}

export function validateMinLength(value: string, min: number): string | null {
  if (!value.trim()) return VALIDATION.required;
  if (value.length < min) return VALIDATION.minLength(min);
  return null;
}

export function validateMaxLength(value: string, max: number): string | null {
  if (value.length > max) return VALIDATION.maxLength(max);
  return null;
}

export function validateNumeric(value: string): string | null {
  if (!value.trim()) return VALIDATION.required;
  if (Number.isNaN(Number(value))) return "Harus berupa angka";
  return null;
}

export function validateUrl(url: string): string | null {
  try {
    new URL(url);
    return null;
  } catch {
    return "URL tidak valid";
  }
}

/**
 * Validates delegation identity for authenticated operations
 * Returns null if valid, error message string if invalid
 *
 * Enhanced to provide specific error messages for different failure scenarios:
 * - Missing identity (not logged in)
 * - Anonymous principal (guest user)
 * - Expired delegation
 * - Delegation expiring soon
 */
export function validateDelegationIdentity(
  identity: Identity | null | undefined,
): string | null {
  // Check if identity exists
  if (!identity) {
    console.log("[validateDelegationIdentity] No identity provided");
    return "Anda harus login terlebih dahulu untuk melakukan operasi ini";
  }

  // Check if it's an anonymous principal
  try {
    const principal = identity.getPrincipal();
    if (principal.isAnonymous()) {
      console.log("[validateDelegationIdentity] Anonymous principal detected");
      return "Anda harus login dengan Internet Identity untuk melakukan operasi ini";
    }
  } catch (error) {
    console.error(
      "[validateDelegationIdentity] Error getting principal:",
      error,
    );
    return "Terjadi kesalahan saat memvalidasi identitas. Silakan login kembali.";
  }

  // Check if it's a delegation identity and validate it
  if (identity instanceof DelegationIdentity) {
    try {
      const delegation = identity.getDelegation();

      // Check if delegation is valid
      if (!isDelegationValid(delegation)) {
        console.log("[validateDelegationIdentity] Delegation is invalid");
        return "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.";
      }

      // Check expiration time
      const expiration = delegation.delegations[0]?.delegation.expiration;
      if (expiration) {
        // Convert from nanoseconds to milliseconds
        const expiryTime = Number(expiration) / 1_000_000;
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;

        console.log(
          "[validateDelegationIdentity] Time until expiry (ms):",
          timeUntilExpiry,
        );

        // Error if already expired
        if (timeUntilExpiry <= 0) {
          console.log("[validateDelegationIdentity] Delegation has expired");
          return "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.";
        }

        // Warn if expiring within 1 minute
        if (timeUntilExpiry < 60_000) {
          console.log("[validateDelegationIdentity] Delegation expiring soon");
          return "Sesi Anda akan segera berakhir. Silakan login kembali untuk melanjutkan.";
        }
      }
    } catch (error) {
      console.error(
        "[validateDelegationIdentity] Error validating delegation:",
        error,
      );
      return "Terjadi kesalahan saat memvalidasi sesi. Silakan login kembali.";
    }
  }

  // Identity is valid
  console.log("[validateDelegationIdentity] Identity is valid");
  return null;
}
