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
import { publicProcedure, router } from "../_core/trpc";
import { getSessionCookieOptions } from "../_core/cookies";
import { deriveRequestContext } from "../analytics/pseudonymise";
import { getUserByEmail } from "../db";
import { verifyPassword } from "./password";
import { signAdminSession, ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE_MS } from "./adminSession";
import { auditAuth } from "./store";

export const adminAuthRouter = router({
  login: publicProcedure
    .input(z.object({ email: z.string().email().max(254).trim().toLowerCase(), password: z.string().min(1).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const rc = deriveRequestContext(ctx.req);
      const user = await getUserByEmail(input.email);
      const ok = user && user.role === "admin" ? await verifyPassword(input.password, user.passwordHash) : false;

      if (!user || user.role !== "admin" || !ok) {
        await auditAuth({ actorType: "admin", email: input.email, event: "login_fail", success: false, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500) });
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect email or password." });
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
});
