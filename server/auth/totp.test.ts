import { describe, it, expect } from "vitest";
import { generateBase32Secret, verifyTotp, otpauthUri } from "./totp";
import { createHmac } from "crypto";

// Re-derive the current token the same way the implementation does, to prove
// verification accepts a valid code and rejects an invalid one.
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function b32decode(s: string): Buffer {
  let bits = 0, val = 0; const out: number[] = [];
  for (const c of s.toUpperCase()) { const i = B32.indexOf(c); if (i < 0) continue; val = (val << 5) | i; bits += 5; if (bits >= 8) { out.push((val >>> (bits - 8)) & 0xff); bits -= 8; } }
  return Buffer.from(out);
}
function token(secret: string, counter: number): string {
  const buf = Buffer.alloc(8); let t = counter;
  for (let i = 7; i >= 0; i--) { buf[i] = t & 0xff; t = Math.floor(t / 256); }
  const h = createHmac("sha1", b32decode(secret)).update(buf).digest();
  const o = h[h.length - 1]! & 0xf;
  const code = ((h[o]! & 0x7f) << 24) | ((h[o + 1]! & 0xff) << 16) | ((h[o + 2]! & 0xff) << 8) | (h[o + 3]! & 0xff);
  return (code % 1_000_000).toString().padStart(6, "0");
}

describe("TOTP", () => {
  it("generates a usable base32 secret", () => {
    const s = generateBase32Secret();
    expect(s.length).toBeGreaterThanOrEqual(16);
    expect(/^[A-Z2-7]+$/.test(s)).toBe(true);
  });

  it("verifies the current valid token and rejects a wrong one", () => {
    const secret = generateBase32Secret();
    const now = Math.floor(Date.now() / 1000 / 30);
    expect(verifyTotp(secret, token(secret, now))).toBe(true);
    expect(verifyTotp(secret, "000000")).toBe(false);
    expect(verifyTotp(secret, "abc")).toBe(false);
    expect(verifyTotp(null, token(secret, now))).toBe(false);
  });

  it("builds an otpauth URI", () => {
    const uri = otpauthUri("ABCDEF", "admin@reni.com");
    expect(uri.startsWith("otpauth://totp/")).toBe(true);
    expect(uri).toContain("secret=ABCDEF");
  });
});
