/**
 * Express adapter for the shared admin API.
 *
 * `handleAdminApi` speaks the standard `Request`/`Response` pair so the Worker
 * can call it directly; this file is the thin translation layer for Node — it
 * rebuilds a `Request` from the Express request (JSON bodies are re-serialized,
 * uploads are read as a raw buffer) and streams the result back.
 *
 * Mounted twice — at `/api/admin` and `/api/media` — so `req.originalUrl`
 * always carries the full path the shared router expects. Both middleware
 * entries use `router.use` rather than a path pattern, which sidesteps
 * path-to-regexp's wildcard syntax entirely.
 */

import express, {
  Router,
  type Request as ExpressRequest,
  type Response as ExpressResponse,
} from "express";
import { handleAdminApi, type AdminApiDeps } from "../admin/api.js";
import { MAX_VIDEO_BYTES } from "../admin/media.js";

/** Uploads are the only bodies Express reads itself; JSON is already parsed. */
const UPLOAD_LIMIT = MAX_VIDEO_BYTES;

function isJsonRequest(nodeReq: { headers: Record<string, unknown> }): boolean {
  const contentType = nodeReq.headers["content-type"];
  return typeof contentType === "string" && contentType.toLowerCase().startsWith("application/json");
}

function buildRequestBody(req: ExpressRequest): {
  body?: Uint8Array | string;
  contentType?: string;
} {
  if (req.method === "GET" || req.method === "HEAD") return {};

  if (Buffer.isBuffer(req.body)) {
    // Raw upload (express.raw): hand the bytes over untouched.
    return {
      body: new Uint8Array(req.body),
      contentType: req.headers["content-type"] ?? "application/octet-stream",
    };
  }

  if (req.body !== undefined && req.body !== null && Object.keys(req.body as object).length > 0) {
    // Parsed by express.json: rebuild an equivalent JSON body.
    return { body: JSON.stringify(req.body), contentType: "application/json" };
  }

  return {};
}

function buildRequest(req: ExpressRequest): Request {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const secure = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) === "https";
  const origin = `${secure ? "https" : "http"}://${req.headers.host ?? "localhost"}`;
  const { body, contentType } = buildRequestBody(req);

  const headers = new Headers();
  // `range` matters: <video> seeks with byte-range requests against /api/media.
  for (const name of [
    "cookie",
    "accept",
    "range",
    "cf-connecting-ip",
    "x-forwarded-for",
  ]) {
    const value = req.headers[name];
    if (typeof value === "string") headers.set(name, value);
  }
  // Never forward length headers: fetch computes the correct one for the body
  // we actually send (JSON gets re-serialized, so the client's count is stale).
  if (contentType) headers.set("content-type", contentType);

  return new Request(`${origin}${req.originalUrl}`, {
    method: req.method,
    headers,
    body,
  });
}

async function copyResponse(response: Response, res: ExpressResponse): Promise<void> {
  res.status(response.status);

  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  const cookies = headers.getSetCookie?.() ?? [];
  if (cookies.length > 0) res.setHeader("Set-Cookie", cookies);

  headers.forEach((value, name) => {
    if (name === "set-cookie" || name === "content-length") return;
    res.setHeader(name, value);
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  res.setHeader("content-length", String(buffer.byteLength));
  res.end(buffer);
}

export function createAdminRouter(deps: AdminApiDeps): Router {
  const router = Router();

  // Reads upload bodies only; requests express.json already consumed
  // (application/json) are left untouched.
  router.use(express.raw({ type: (nodeReq) => !isJsonRequest(nodeReq), limit: UPLOAD_LIMIT }));

  router.use(async (req, res) => {
    try {
      const response = await handleAdminApi(buildRequest(req), deps);
      await copyResponse(response, res);
    } catch (error) {
      // express.raw body-limit breaches arrive as a PayloadTooLargeError.
      const status = (error as { status?: number }).status;
      if (status === 413) {
        res.status(413).json({ error: "That file is too large to upload." });
        return;
      }
      console.error("admin route error", error);
      if (!res.headersSent) res.status(500).json({ error: "Something went wrong." });
    }
  });

  return router;
}
