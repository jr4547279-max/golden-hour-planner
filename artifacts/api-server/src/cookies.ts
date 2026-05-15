import type { CookieOptions, Request } from "express";

export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

function isSecureRequest(req: Request): boolean {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some((p) => p.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: Request): CookieOptions {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // SameSite=None requires Secure; fall back to Lax for local/http
    sameSite: secure ? "none" : "lax",
    secure,
    // Fix: always persist for a year — without maxAge cookies are session-only
    // and vanish when the browser tab closes.
    maxAge: ONE_YEAR_MS,
  };
}

export function clearSessionCookieOptions(req: Request): CookieOptions {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "none" : "lax",
    secure,
    maxAge: -1,
  };
}
