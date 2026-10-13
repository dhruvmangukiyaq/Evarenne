import { request } from "./api";
import type {
  AdminProductInput,
  AdminSession,
  MediaUploadResponse,
  Product,
} from "./api-types";

/**
 * Admin panel API — password login, diamond CRUD and photo/video upload.
 *
 * Same-origin requests carry the signed session cookie automatically, so
 * nothing here manages auth state: a 401 simply means "sign in again", which
 * the guard reacts to by sending the browser to /admin/login.
 *
 * These routes are never linked from the public site.
 */

/** Max upload sizes — mirrors the server so a bad file fails fast, locally. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

const EXT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
};

/**
 * The file's type as the server should see it. `File.type` is empty for some
 * extensions on some platforms, so the extension is consulted before giving
 * up — otherwise an uploadable JPEG would be rejected as unsupported.
 */
export function uploadContentType(file: File): string | null {
  const declared = file.type.split(";")[0]?.trim().toLowerCase() ?? "";
  const known: readonly string[] = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];
  if (declared && known.includes(declared)) return declared;

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TYPES[ext] ?? null;
}

export const adminApi = {
  session: (signal?: AbortSignal) =>
    request<AdminSession>("/api/admin/session", { signal }),

  login: (password: string) =>
    request<{ ok: true }>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  logout: () => request<{ ok: true }>("/api/admin/logout", { method: "POST" }),

  products: (signal?: AbortSignal) =>
    request<{ products: Product[] }>("/api/admin/products", { signal }),

  product: (id: string) =>
    request<{ product: Product }>(`/api/admin/products/${encodeURIComponent(id)}`),

  create: (input: AdminProductInput) =>
    request<{ product: Product }>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: AdminProductInput) =>
    request<{ product: Product }>(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    request<{ ok: true }>(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  /** Streams the file as a raw body; `Content-Type` carries its media type. */
  upload: (file: File) => {
    const contentType = uploadContentType(file);
    if (!contentType) {
      return Promise.reject(
        new Error(`"${file.name}" isn't a supported file type. Use JPEG, PNG, WebP, AVIF, MP4 or WebM.`),
      );
    }
    return request<MediaUploadResponse>("/api/admin/media", {
      method: "POST",
      headers: { "content-type": contentType },
      body: file,
    });
  },
};
