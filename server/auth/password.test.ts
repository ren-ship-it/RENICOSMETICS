import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./password";

describe("password hashing", () => {
  it("verifies a correct password and rejects a wrong one", async () => {
    const hash = await hashPassword("Sup3rSecret");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("Sup3rSecret", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("produces a different hash each time (random salt)", async () => {
    const a = await hashPassword("samePassword1");
    const b = await hashPassword("samePassword1");
    expect(a).not.toEqual(b);
    expect(await verifyPassword("samePassword1", a)).toBe(true);
    expect(await verifyPassword("samePassword1", b)).toBe(true);
  });

  it("safely rejects null/garbage stored hashes", async () => {
    expect(await verifyPassword("x", null)).toBe(false);
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    expect(await verifyPassword("x", "scrypt$1$bad")).toBe(false);
  });
});

describe("password strength", () => {
  it("rejects weak passwords and accepts strong ones", () => {
    expect(validatePasswordStrength("short")).toBeTruthy();
    expect(validatePasswordStrength("allletters")).toBeTruthy();
    expect(validatePasswordStrength("12345678")).toBeTruthy();
    expect(validatePasswordStrength("letters123")).toBeNull();
  });
});
