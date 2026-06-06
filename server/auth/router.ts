/**
 * Customer authentication & account router (storefront).
 *
 * Security properties:
 * - scrypt password hashing; constant-time verification.
 * - httpOnly + sameSite session cookie (separate from admin).
 * - Login & password-reset are non-enumerating (generic responses).
 * - Single-use, time-limited, hashed password-reset tokens.
 * - Every sensitive event is written to the auth audit log (hashed IP).
 * - Rate limiting applied at the Express layer (see server/_core/index.ts).
 */
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { publicProcedure, customerProcedure, router } from "../_core/trpc";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import { deriveRequestContext } from "../analytics/pseudonymise";
import { getOrdersByCustomer } from "../db";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./password";
import {
  signCustomerSession,
  CUSTOMER_COOKIE_NAME,
  CUSTOMER_SESSION_MAX_AGE_MS,
} from "./session";
import * as store from "./store";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const emailSchema = z.string().email().max(254).trim().toLowerCase();

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function publicCustomer(c: {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  suburb: string | null;
  state: string | null;
  postcode: string | null;
  acceptsMarketing: boolean | null;
  totalOrders: number;
  totalSpent: string | null;
  emailVerified: boolean;
  createdAt: Date;
}) {
  // Never expose passwordHash or internal-only fields.
  return {
    id: c.id,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    address: c.address,
    suburb: c.suburb,
    state: c.state,
    postcode: c.postcode,
    acceptsMarketing: !!c.acceptsMarketing,
    totalOrders: c.totalOrders,
    totalSpent: c.totalSpent,
    emailVerified: c.emailVerified,
    memberSince: c.createdAt,
  };
}

export const customerAuthRouter = router({
  // Current customer (null when signed out).
  me: publicProcedure.query(({ ctx }) => (ctx.customer ? publicCustomer(ctx.customer) : null)),

  signup: publicProcedure
    .input(
      z.object({
        email: emailSchema,
        password: z.string().min(8).max(200),
        firstName: z.string().max(128).trim().optional(),
        lastName: z.string().max(128).trim().optional(),
        acceptsMarketing: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rc = deriveRequestContext(ctx.req);
      const strengthError = validatePasswordStrength(input.password);
      if (strengthError) throw new TRPCError({ code: "BAD_REQUEST", message: strengthError });

      const existing = await store.getCustomerByEmail(input.email);
      const passwordHash = await hashPassword(input.password);

      let customer = existing;
      if (existing) {
        if (existing.passwordHash) {
          // Account already exists — don't reveal more than necessary.
          await store.auditAuth({ actorType: "customer", email: input.email, event: "signup", success: false, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500), detail: "email already registered" });
          throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists. Try signing in." });
        }
        // Claim an existing guest checkout record by setting a password.
        await store.setCustomerPassword(existing.id, passwordHash);
        if (input.acceptsMarketing) await store.setMarketingConsent(existing.id, true);
        customer = await store.getCustomerById(existing.id);
      } else {
        customer = await store.createCustomerWithPassword({
          email: input.email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          acceptsMarketing: input.acceptsMarketing,
        });
      }

      if (!customer) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not create account." });

      const token = await signCustomerSession({ customerId: customer.id, email: customer.email });
      ctx.res.cookie(CUSTOMER_COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: CUSTOMER_SESSION_MAX_AGE_MS });
      await store.touchLogin(customer.id);
      await store.auditAuth({ actorType: "customer", actorId: String(customer.id), email: customer.email, event: "signup", success: true, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500) });
      return publicCustomer(customer);
    }),

  login: publicProcedure
    .input(z.object({ email: emailSchema, password: z.string().min(1).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const rc = deriveRequestContext(ctx.req);
      const customer = await store.getCustomerByEmail(input.email);
      const ok = customer ? await verifyPassword(input.password, customer.passwordHash) : false;

      if (!customer || !ok) {
        await store.auditAuth({ actorType: "customer", email: input.email, event: "login_fail", success: false, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500) });
        // Generic message — do not reveal whether the email exists.
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect email or password." });
      }

      const token = await signCustomerSession({ customerId: customer.id, email: customer.email });
      ctx.res.cookie(CUSTOMER_COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: CUSTOMER_SESSION_MAX_AGE_MS });
      await store.touchLogin(customer.id);
      await store.auditAuth({ actorType: "customer", actorId: String(customer.id), email: customer.email, event: "login_success", success: true, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500) });
      return publicCustomer(customer);
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(CUSTOMER_COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
    if (ctx.customer) {
      store.auditAuth({ actorType: "customer", actorId: String(ctx.customer.id), email: ctx.customer.email, event: "logout", success: true }).catch(() => {});
    }
    return { success: true } as const;
  }),

  requestPasswordReset: publicProcedure
    .input(z.object({ email: emailSchema }))
    .mutation(async ({ ctx, input }) => {
      const rc = deriveRequestContext(ctx.req);
      const customer = await store.getCustomerByEmail(input.email);
      // Always behave the same way to avoid account enumeration.
      let devToken: string | undefined;
      if (customer && customer.passwordHash) {
        const raw = randomBytes(32).toString("hex");
        await store.createResetToken(customer.id, sha256(raw), new Date(Date.now() + RESET_TOKEN_TTL_MS));
        await store.auditAuth({ actorType: "customer", actorId: String(customer.id), email: input.email, event: "password_reset_request", success: true, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500) });
        // Email delivery is handled by the (pending) transactional email layer.
        // Until then, expose the token only in non-production so the flow works.
        if (!ENV.isProduction) devToken = raw;
        else console.log(`[Auth] password reset requested for customer ${customer.id}`);
      } else {
        await store.auditAuth({ actorType: "anonymous", email: input.email, event: "password_reset_request", success: false, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500), detail: "no account" });
      }
      return { ok: true, devToken } as const;
    }),

  resetPassword: publicProcedure
    .input(z.object({ token: z.string().min(10).max(128), password: z.string().min(8).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const rc = deriveRequestContext(ctx.req);
      const strengthError = validatePasswordStrength(input.password);
      if (strengthError) throw new TRPCError({ code: "BAD_REQUEST", message: strengthError });

      const row = await store.getValidResetToken(sha256(input.token));
      if (!row) {
        await store.auditAuth({ actorType: "anonymous", event: "password_reset", success: false, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500), detail: "invalid/expired token" });
        throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link is invalid or has expired. Please request a new one." });
      }
      const passwordHash = await hashPassword(input.password);
      await store.setCustomerPassword(row.customerId, passwordHash);
      await store.markResetTokenUsed(row.id);
      await store.auditAuth({ actorType: "customer", actorId: String(row.customerId), event: "password_reset", success: true, ipHash: rc.ipHash, userAgent: rc.userAgent?.slice(0, 500) });
      return { ok: true } as const;
    }),

  updateProfile: customerProcedure
    .input(
      z.object({
        firstName: z.string().max(128).trim().optional(),
        lastName: z.string().max(128).trim().optional(),
        phone: z.string().max(32).trim().optional(),
        address: z.string().max(512).trim().optional(),
        suburb: z.string().max(128).trim().optional(),
        state: z.string().max(16).trim().optional(),
        postcode: z.string().max(8).trim().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await store.updateCustomerProfile(ctx.customer.id, input);
      await store.auditAuth({ actorType: "customer", actorId: String(ctx.customer.id), email: ctx.customer.email, event: "profile_update", success: true });
      const updated = await store.getCustomerById(ctx.customer.id);
      return updated ? publicCustomer(updated) : null;
    }),

  // Marketing consent management (Spam Act / APP 7).
  updateMarketingConsent: customerProcedure
    .input(z.object({ acceptsMarketing: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await store.setMarketingConsent(ctx.customer.id, input.acceptsMarketing);
      await store.auditAuth({ actorType: "customer", actorId: String(ctx.customer.id), email: ctx.customer.email, event: "consent_update", success: true, detail: `acceptsMarketing=${input.acceptsMarketing}` });
      return { ok: true, acceptsMarketing: input.acceptsMarketing };
    }),

  myOrders: customerProcedure.query(async ({ ctx }) => {
    return getOrdersByCustomer(ctx.customer.email);
  }),

  securityLog: customerProcedure.query(async ({ ctx }) => {
    const events = await store.recentAuthEvents(ctx.customer.id, 10);
    return events.map(e => ({ event: e.event, success: e.success, at: e.createdAt }));
  }),
});
