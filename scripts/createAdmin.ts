/**
 * Bootstrap / reset a first-party admin account (no hardcoded credentials).
 *
 * Usage:
 *   pnpm tsx scripts/createAdmin.ts <email> <password> [name]
 * or via env:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm admin:create
 *
 * Idempotent: re-running updates the password and ensures role=admin.
 */
import "dotenv/config";
import { hashPassword, validatePasswordStrength } from "../server/auth/password";
import { upsertLocalAdmin } from "../server/db";

async function main() {
  const email = process.argv[2] ?? process.env.ADMIN_EMAIL;
  const password = process.argv[3] ?? process.env.ADMIN_PASSWORD;
  const name = process.argv[4] ?? process.env.ADMIN_NAME;

  if (!email || !password) {
    console.error("Usage: tsx scripts/createAdmin.ts <email> <password> [name]");
    console.error("   or: ADMIN_EMAIL=.. ADMIN_PASSWORD=.. pnpm admin:create");
    process.exit(1);
  }
  const strengthError = validatePasswordStrength(password);
  if (strengthError) {
    console.error(`Weak password: ${strengthError}`);
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const hash = await hashPassword(password);
  const admin = await upsertLocalAdmin(email.toLowerCase(), hash, name);
  if (!admin) {
    console.error("Failed to create admin (no row returned).");
    process.exit(1);
  }
  console.log(`Admin ready: ${admin.email} (id ${admin.id}, role ${admin.role}). Sign in at /admin/login`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
