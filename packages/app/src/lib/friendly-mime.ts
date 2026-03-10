import { resolveMime, resolveFileType } from "friendly-mimes";

/**
 * Returns a human-readable name for a file based on its mime type and key.
 * Tries mime type first (skipping generic `application/octet-stream`),
 * then falls back to file extension, then returns the raw mime type.
 */
export function getFriendlyTypeName(contentType: string, objectKey: string): string {
  // Try mime type first (skip octet-stream — it's useless)
  if (contentType && contentType !== "application/octet-stream") {
    try {
      return resolveMime(contentType).name;
    } catch {
      // not in the database, fall through
    }
  }

  // Fall back to file extension
  const dot = objectKey.lastIndexOf(".");
  if (dot !== -1) {
    const ext = objectKey.slice(dot).toLowerCase();
    try {
      return resolveFileType(ext).name;
    } catch {
      // not in the database, fall through
    }
  }

  return contentType;
}
