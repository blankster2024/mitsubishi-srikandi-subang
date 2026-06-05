/**
 * Utility functions for constructing blob URLs from MediaAsset data
 * and determining asset types based on MIME types.
 *
 * All images are stored in stable canister storage with persistent blob data.
 */

/**
 * Converts MediaAsset blob data (Uint8Array) to a browser-displayable blob URL.
 * This creates a temporary object URL from the persistent canister blob data.
 *
 * @param data - The Uint8Array blob data from stable canister storage
 * @param mimeType - The MIME type of the blob
 * @returns A blob URL that can be used in img src attributes
 */
export function createBlobUrlFromData(
  data: Uint8Array,
  mimeType: string,
): string {
  // Convert to standard Uint8Array to ensure TypeScript compatibility
  const standardArray = new Uint8Array(data);
  const blob = new Blob([standardArray], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Determines if a MIME type represents an image that can be displayed
 * in an <img> tag.
 *
 * @param mimeType - The MIME type string (e.g., 'image/jpeg', 'application/pdf')
 * @returns true if the MIME type is an image format, false otherwise
 */
export function isImageMimeType(mimeType: string): boolean {
  const imageMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  return imageMimeTypes.includes(mimeType.toLowerCase());
}

/**
 * Determines if a MIME type represents a PDF document.
 *
 * @param mimeType - The MIME type string
 * @returns true if the MIME type is PDF, false otherwise
 */
export function isPdfMimeType(mimeType: string): boolean {
  return mimeType.toLowerCase() === "application/pdf";
}
