/**
 * Admin authentication — password verification plus signed session cookies.
 *
 * Built on the Web Crypto API, which exists in both Node 18+ and Cloudflare
 * Workers, so the exact same logic runs in the local Express dev server and in
 * the production Worker. No third-party auth dependency.
 *
 * The admin password itself comes from the environment (`ADMIN_PASSWORD` in
 * local dev, a `wrangler secret` in production) and is never stored in code.
 */

const encoder = new TextEncoder();

/** SHA-256 → raw bytes, used so secret comparisons never leak lengths. */
async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return new Uint8Array(digest);
}

/** Constant-time byte comparison (a length mismatch still short-circuits). */
function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

/** Verifies the supplied password. Always false when no password is configured. */
export async function verifyPassword(given: string, expected: string): Promise<boolean> {
  if (!expected) return false;
  return equalBytes(await sha256(given), await sha256(expected));
}

/* ---------------- Session tokens ---------------- */

export const SESSION_COOKIE = "evarenne_admin";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

/**
 * Session secret. An explicit secret wins; otherwise the (never-revealed)
 * admin password is used as the signing key — sessions then live and die with
 * the password, which is the behaviour we want for a single-admin site.
 */
export function resolveSessionSecret(adminPassword: string, explicit?: string): string {
  const candidate = explicit?.trim();
  if (candidate && candidate.length >= 16) return candidate;
  return `evarenne-session:${adminPassword}`;
}

/** Signs a session token that expires in seven days. */
export async function createSessionToken(secret: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = toBase64Url(await hmac(secret, String(expiresAt)));
  return `${expiresAt}.${signature}`;
}

/** Validates a session token: signature matches and it has not expired. */
export async function isValidSessionToken(
  secret: string,
  token: string | null | undefined,
): Promise<boolean> {
  if (!token) return false;
  const [expiresRaw, signature] = token.split(".");
  if (!expiresRaw || !signature) return false;
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
  const expected = fromBase64Url(toBase64Url(await hmac(secret, expiresRaw)));
  const actual = fromBase64Url(signature);
  if (!expected || !actual) return false;
  return equalBytes(expected, actual);
}

/* ---------------- Cookies ---------------- */

/** Reads one cookie from a `Cookie` request header. */
export function readCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

/** `Set-Cookie` for a fresh session. `Secure` is only set on https origins. */
export function buildSessionCookie(token: string, secure: boolean): string {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
    secure ? "; Secure" : ""
  }`;
}

/** `Set-Cookie` that immediately expires the session (used by logout). */
export function buildClearCookie(secure: boolean): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
}
