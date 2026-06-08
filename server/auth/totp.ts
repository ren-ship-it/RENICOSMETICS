/**
 * Dependency-free TOTP (RFC 6238) for multi-factor auth.
 *
 * Standard 30-second step, 6 digits, HMAC-SHA1 — compatible with Google
 * Authenticator, 1Password, Authy, etc. Secrets are base32. (Store the secret
 * encrypted at rest in a hardened deployment; it is kept in `users.mfaSecret`.)
 */
import { createHmac, randomBytes } from "crypto";

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateBase32Secret(bytes = 20): string {
  const buf = randomBytes(bytes);
  let bits = 0, val = 0, out = "";
  for (let i = 0; i < buf.length; i++) {
    val = (val << 8) | buf[i]!;
    bits += 8;
    while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
}

function base32Decode(s: string): Buffer {
  const clean = s.replace(/=+$/, "").toUpperCase();
  let bits = 0, val = 0;
  const out: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = B32.indexOf(clean[i]!);
    if (idx < 0) continue;
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return Buffer.from(out);
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  let tmp = counter;
  for (let i = 7; i >= 0; i--) { buf[i] = tmp & 0xff; tmp = Math.floor(tmp / 256); }
  const hmac = createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const code =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return (code % 1_000_000).toString().padStart(6, "0");
}

/** Verify a 6-digit token allowing +/- `window` steps for clock drift. */
export function verifyTotp(secretB32: string | null | undefined, token: string, window = 1): boolean {
  if (!secretB32 || !/^\d{6}$/.test(token)) return false;
  const secret = base32Decode(secretB32);
  const counter = Math.floor(Date.now() / 1000 / 30);
  for (let i = -window; i <= window; i++) {
    if (hotp(secret, counter + i) === token) return true;
  }
  return false;
}

export function otpauthUri(secret: string, label: string, issuer = "Reni Cosmetics"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&period=30&digits=6&algorithm=SHA1`;
}
