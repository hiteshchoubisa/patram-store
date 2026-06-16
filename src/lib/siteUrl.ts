import type { NextRequest } from "next/server";

/** Canonical site URL for payment redirects — prefers env, falls back to request host (www-safe). */
export function getSiteUrl(request?: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (request) {
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
