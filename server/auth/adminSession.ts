/**
 * First-party admin session tokens (parallel to Manus OAuth).
 *
 * A successful email+password admin login issues this JWT in a dedicated
 * httpOnly cookie. The tRPC context loads the matching `users` row into
 * `ctx.user`, so all existing `adminProcedure` checks work unchanged whether the
 * admin authenticated via OAuth or via first-party login.
 */
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../_core/env";

export const ADMIN_COOKIE_NAME = "reni_admin_session";
const ISSUER = "reni-cosmetics";
const AUDIENCE = "admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours — shorter for privileged access

function getSecret(): Uint8Array {
  const secret = ENV.cookieSecret || "reni-dev-only-insecure-secret";
  return new TextEncoder().encode(secret);
}

export async function signAdminSession(userId: number): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyAdminSession(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer: ISSUER, audience: AUDIENCE });
    const userId = Number(payload.sub);
    return userId || null;
  } catch {
    return null;
  }
}

export const ADMIN_SESSION_MAX_AGE_MS = MAX_AGE_SECONDS * 1000;
