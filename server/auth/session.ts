/**
 * Customer session tokens (JWT via jose), kept separate from the admin session.
 *
 * The token is stored in an httpOnly cookie. We use a dedicated cookie name so
 * customer and admin sessions never collide, preserving a clear separation
 * between customer and admin access (RBAC at the transport layer).
 */
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../_core/env";

export const CUSTOMER_COOKIE_NAME = "reni_customer_session";
const ISSUER = "reni-cosmetics";
const AUDIENCE = "customer";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface CustomerSessionPayload {
  customerId: number;
  email: string;
}

function getSecret(): Uint8Array {
  const secret = ENV.cookieSecret || "reni-dev-only-insecure-secret";
  return new TextEncoder().encode(secret);
}

export async function signCustomerSession(payload: CustomerSessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.customerId))
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyCustomerSession(token: string): Promise<CustomerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    const customerId = Number(payload.sub);
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!customerId || !email) return null;
    return { customerId, email };
  } catch {
    return null;
  }
}

export const CUSTOMER_SESSION_MAX_AGE_MS = MAX_AGE_SECONDS * 1000;
