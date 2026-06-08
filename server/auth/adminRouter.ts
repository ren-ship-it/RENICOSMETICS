/**
 * First-party admin authentication router (parallel to Manus OAuth).
 *
 * Brand-owned email + password login for the admin panel. On success it issues
 * a short-lived admin session cookie; the tRPC context resolves it into
 * `ctx.user`, so the rest of the admin surface is unchanged. Hardened with
 * non-enumerating responses, audit logging and rate limiting (Express layer).
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { getSessionCookieOptions } from "../_core/cookies";
import { deriveRequestContext } from "../analytics/pseudonymise";
import { getUserByEmail, getUserById, setUserMfa } from "../db";
import { verifyPassword } from "./password";
import { signAdminSession, ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE_MS } from "./adminSession";
import { auditAuth } from "./store";
import { generateBase32Secret, verifyTotp, otpauthUri } from "./totp";

export const adminAuthRouter = router({
  login: publicProcedure
    .input(z.object({ email: z.string().email().max(254).trim().toLowerCase(), password: z.string().min(1).max(200), code: z.string().max(10).optional() }))
    .mutation(async ({ ctx, input }) => {
      const rc = deriveRequestContext(ctx.req);
      const user = await getUserByEmail(input.email);
      const ok = user && user.role === "admin" ? await verifyPassword(input.password, user.passwordHash) : false;

      if (!user || user.role !== "admin" || !ok) {
        await auditAuth({ actorType: "admin", email: input.email, event: "login_fail", success: false, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500) });
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect email or password." });
      }

      // Enforce MFA when enabled. The UI prompts for a code on MFA_REQUIRED.
      if (user.mfaEnabled) {
        if (!input.code) throw new TRPCError({ code: "UNAUTHORIZED", message: "MFA_REQUIRED" });
        if (!verifyTotp(user.mfaSecret, input.code)) {
          await auditAuth({ actorType: "admin", actorId: String(user.id), email: user.email, event: "login_fail", success: false, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500), detail: "bad mfa code" });
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid authentication code." });
        }
      }

      const token = await signAdminSession(user.id);
      ctx.res.cookie(ADMIN_COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ADMIN_SESSION_MAX_AGE_MS });
      await auditAuth({ actorType: "admin", actorId: String(user.id), email: user.email, event: "login_success", success: true, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500) });
      return { success: true } as const;
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(ADMIN_COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
    if (ctx.user) {
      auditAuth({ actorType: "admin", actorId: String(ctx.user.id), email: ctx.user.email, event: "logout", success: true }).catch(() => {});
    }
    return { success: true } as const;
  }),

  // ── MFA enrollment (requires an authenticated admin session) ─────────────
  mfaStatus: adminProcedure.query(({ ctx }) => ({ enabled: !!ctx.user.mfaEnabled })),

  // Generate a pending secret + otpauth URI to add to an authenticator app.
  mfaBeginEnroll: adminProcedure.mutation(async ({ ctx }) => {
    const secret = generateBase32Secret();
    // Store as pending (enabled stays false until a code is confirmed).
    await setUserMfa(ctx.user.id, secret, false);
    return { secret, otpauthUri: otpauthUri(secret, ctx.user.email ?? "admin") };
  }),

  // Confirm the first code to switch MFA on.
  mfaConfirm: adminProcedure
    .input(z.object({ code: z.string().min(6).max(6) }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserById(ctx.user.id);
      if (!user?.mfaSecret) throw new TRPCError({ code: "BAD_REQUEST", message: "Start enrollment first." });
      if (!verifyTotp(user.mfaSecret, input.code)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid authentication code. Try again." });
      }
      await setUserMfa(ctx.user.id, user.mfaSecret, true);
      await auditAuth({ actorType: "admin", actorId: String(ctx.user.id), email: ctx.user.email, event: "mfa_enabled", success: true });
      return { ok: true };
    }),

  // Disable MFA (requires a current valid code).
  mfaDisable: adminProcedure
    .input(z.object({ code: z.string().min(6).max(6) }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserById(ctx.user.id);
      if (!user?.mfaEnabled) return { ok: true };
      if (!verifyTotp(user.mfaSecret, input.code)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid authentication code." });
      await setUserMfa(ctx.user.id, null, false);
      await auditAuth({ actorType: "admin", actorId: String(ctx.user.id), email: ctx.user.email, event: "mfa_disabled", success: true });
      return { ok: true };
    }),
});
