/**
 * Media handling for admin uploads — photos and video for a diamond.
 *
 * Shared by both runtimes: the byte limits, accepted types and key generation
 * live here, while storage itself is injected (local disk in Express, R2 in the
 * Worker). Uploads are sent as a raw request body with the file's MIME type in
 * `Content-Type`, which avoids a multipart parser dependency entirely.
 */

export interface MediaObject {
  bytes: Uint8Array;
  contentType: string | null;
}

export interface MediaStore {
  put(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<MediaObject | null>;
}

const CONTENT_TYPE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/** Ten megabytes per photo. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
/**
 * Thirty megabytes per video. The Worker buffers an object to answer Range
 * requests (video seeking), so the cap keeps peak memory well inside the
 * 128 MB isolate limit even with a range slice alongside the full body.
 */
export const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

/**
 * Media keys are unique per upload and never overwritten, so responses can be
 * cached hard — replacing a photo in the admin panel always mints a new key.
 */
export const MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

export type MediaKind = "image" | "video";

/** Storage keys are machine-generated; this rejects anything else outright. */
const SAFE_KEY = /^[a-z0-9][a-z0-9.-]*\.[a-z0-9]{2,8}$/;

export function isSafeMediaKey(key: string): boolean {
  return key.length <= 128 && SAFE_KEY.test(key) && !key.includes("..");
}

function normaliseType(contentType: string): string {
  return (contentType.split(";")[0] ?? "").trim().toLowerCase();
}

/** Returns the media family for a content type, or null when unsupported. */
export function mediaKind(contentType: string): MediaKind | null {
  const type = normaliseType(contentType);
  if (!(type in CONTENT_TYPE_EXT)) return null;
  return type.startsWith("video/") ? "video" : "image";
}

export function mediaLimit(kind: MediaKind): number {
  return kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
}

/** Builds a collision-free storage key, or null for an unsupported type. */
export function newMediaKey(contentType: string): string | null {
  const type = normaliseType(contentType);
  const ext = CONTENT_TYPE_EXT[type];
  if (!ext) return null;
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `${Date.now().toString(36)}-${random}.${ext}`;
}

/** In-memory store: used by tests and as a safe fallback when none is bound. */
export class MemoryMediaStore implements MediaStore {
  readonly files = new Map<string, MediaObject>();

  async put(key: string, bytes: Uint8Array, contentType: string): Promise<void> {
    this.files.set(key, { bytes, contentType });
  }

  async get(key: string): Promise<MediaObject | null> {
    return this.files.get(key) ?? null;
  }
}
