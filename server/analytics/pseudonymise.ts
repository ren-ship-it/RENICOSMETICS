/**
 * Pseudonymisation & request enrichment helpers.
 *
 * Privacy stance: we never persist a raw IP address. The IP is used only to
 * derive (a) a salted, non-reversible hash for abuse/dedup and (b) coarse geo
 * (country / state) where the hosting layer provides it. The salt is the app
 * secret, so hashes are not portable outside this deployment.
 */
import { createHmac } from "crypto";
import type { Request } from "express";
import { ENV } from "../_core/env";

const SALT = ENV.cookieSecret || "reni-analytics-fallback-salt";

/** One-way, salted hash of an identifier. Stable within this deployment only. */
export function hashIdentifier(value: string | undefined | null): string | null {
  if (!value) return null;
  return createHmac("sha256", SALT).update(value).digest("hex").slice(0, 32);
}

/** Best-effort client IP from common proxy headers. Never stored raw. */
function getClientIp(req: Request): string | undefined {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length) return xff.split(",")[0]!.trim();
  if (Array.isArray(xff) && xff.length) return xff[0]!.split(",")[0]!.trim();
  return req.socket?.remoteAddress ?? undefined;
}

function firstHeader(req: Request, names: string[]): string | undefined {
  for (const n of names) {
    const v = req.headers[n];
    if (typeof v === "string" && v.length) return v;
    if (Array.isArray(v) && v.length) return v[0];
  }
  return undefined;
}

/** Coarse geo from CDN/edge headers, if present. Country & state only. */
export function getCoarseGeo(req: Request): { country?: string; region?: string } {
  const country = firstHeader(req, [
    "cf-ipcountry",
    "x-vercel-ip-country",
    "x-geo-country",
    "x-country-code",
  ]);
  const region = firstHeader(req, [
    "x-vercel-ip-country-region",
    "x-geo-region",
    "x-region-code",
  ]);
  return {
    country: country && country !== "XX" ? country : undefined,
    region: region || undefined,
  };
}

export interface DeviceContext {
  deviceType: "mobile" | "tablet" | "desktop" | "bot" | "unknown";
  browser: string;
  os: string;
}

/**
 * Minimal, dependency-free user-agent classifier. Deliberately coarse — we want
 * device class, browser family and OS family, not a fingerprint.
 */
export function parseUserAgent(ua: string | undefined): DeviceContext {
  if (!ua) return { deviceType: "unknown", browser: "unknown", os: "unknown" };
  const s = ua.toLowerCase();

  let deviceType: DeviceContext["deviceType"] = "desktop";
  if (/bot|crawler|spider|crawling|headless/.test(s)) deviceType = "bot";
  else if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(s)) deviceType = "tablet";
  else if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(s)) deviceType = "mobile";

  let browser = "other";
  if (/edg\//.test(s)) browser = "Edge";
  else if (/opr\/|opera/.test(s)) browser = "Opera";
  else if (/chrome|crios/.test(s)) browser = "Chrome";
  else if (/firefox|fxios/.test(s)) browser = "Firefox";
  else if (/safari/.test(s)) browser = "Safari";

  let os = "other";
  if (/windows/.test(s)) os = "Windows";
  else if (/iphone|ipad|ipod|ios/.test(s)) os = "iOS";
  else if (/mac os x|macintosh/.test(s)) os = "macOS";
  else if (/android/.test(s)) os = "Android";
  else if (/linux/.test(s)) os = "Linux";

  return { deviceType, browser, os };
}

export interface RequestContext {
  ipHash: string | null;
  userAgent: string | undefined;
  device: DeviceContext;
  country?: string;
  region?: string;
}

/** Derive the full pseudonymised request context for an incoming request. */
export function deriveRequestContext(req: Request): RequestContext {
  const ua = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : undefined;
  const geo = getCoarseGeo(req);
  return {
    ipHash: hashIdentifier(getClientIp(req)),
    userAgent: ua,
    device: parseUserAgent(ua),
    country: geo.country,
    region: geo.region,
  };
}
