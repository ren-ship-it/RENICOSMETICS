/**
 * Abandoned-cart capture + consent-gated recovery.
 *
 * Captured when a shopper reaches checkout (email + items + marketing consent).
 * A single recovery email is sent ONLY to shoppers who opted into marketing and
 * who haven't completed the order — compliant with the Spam Act 2003.
 */
import { z } from "zod";
import { and, desc, eq, gt, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { abandonedCarts } from "../../drizzle/schema";
import { sendEmail, appOrigin } from "../email";
import { abandonedCartEmail } from "../email/templates";

export const cartRouter = router({
  // Capture / refresh an abandoned cart (public; called when checkout starts).
  capture: publicProcedure
    .input(
      z.object({
        email: z.string().email().max(254).trim().toLowerCase(),
        customerName: z.string().max(256).optional(),
        items: z.array(z.object({ name: z.string(), qty: z.number().int().positive() })).max(50),
        subtotal: z.number().nonnegative().optional(),
        acceptsMarketing: z.boolean().default(false),
        visitorId: z.string().max(64).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { ok: false } as const;
      const values = {
        email: input.email,
        customerName: input.customerName,
        items: input.items,
        subtotal: input.subtotal !== undefined ? String(input.subtotal.toFixed(2)) : undefined,
        acceptsMarketing: input.acceptsMarketing,
        visitorId: input.visitorId,
        recovered: false,
        remindersSent: 0,
      };
      await db
        .insert(abandonedCarts)
        .values(values)
        .onDuplicateKeyUpdate({
          set: {
            customerName: input.customerName,
            items: input.items,
            subtotal: values.subtotal,
            acceptsMarketing: input.acceptsMarketing,
            recovered: false,
            remindersSent: 0,
            lastReminderAt: null,
            updatedAt: new Date(),
          },
        })
        .catch(() => {});
      return { ok: true } as const;
    }),

  // Admin: list recent abandoned carts.
  adminList: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(abandonedCarts).orderBy(desc(abandonedCarts.updatedAt)).limit(100);
  }),

  // Send recovery emails (admin trigger; also cron-able). Only consented,
  // not-yet-recovered carts older than `olderThanMinutes` get ONE reminder.
  sendReminders: adminProcedure
    .input(z.object({ olderThanMinutes: z.number().int().min(15).max(10080).default(60) }).optional())
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { sent: 0 };
      const cutoff = new Date(Date.now() - (input?.olderThanMinutes ?? 60) * 60 * 1000);
      const candidates = await db
        .select()
        .from(abandonedCarts)
        .where(
          and(
            eq(abandonedCarts.recovered, false),
            eq(abandonedCarts.acceptsMarketing, true),
            eq(abandonedCarts.remindersSent, 0),
            lt(abandonedCarts.createdAt, cutoff),
          ),
        )
        .limit(200);

      const proto = (ctx.req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] || "https";
      const origin = appOrigin(ctx.req.headers.host, proto);
      let sent = 0;
      for (const c of candidates) {
        const items = Array.isArray(c.items) ? (c.items as Array<{ name: string; qty: number }>) : [];
        const email = abandonedCartEmail({ customerName: c.customerName ?? undefined, items, recoverUrl: `${origin}/cart` });
        const ok = await sendEmail({ to: c.email, ...email }).catch(() => false);
        if (ok) {
          await db.update(abandonedCarts).set({ remindersSent: 1, lastReminderAt: new Date() }).where(eq(abandonedCarts.id, c.id)).catch(() => {});
          sent++;
        }
      }
      return { sent, candidates: candidates.length };
    }),
});

/** Mark a cart recovered when a matching paid order arrives (called from events). */
export async function markCartRecovered(email: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(abandonedCarts)
    .set({ recovered: true, updatedAt: new Date() })
    .where(eq(abandonedCarts.email, email.toLowerCase()))
    .catch(() => {});
}

/** Count of open (unrecovered) abandoned carts — for the dashboard. */
export async function openAbandonedCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db
    .select({ id: abandonedCarts.id })
    .from(abandonedCarts)
    .where(and(eq(abandonedCarts.recovered, false), gt(abandonedCarts.createdAt, new Date(Date.now() - 30 * 86400000))));
  return rows.length;
}
