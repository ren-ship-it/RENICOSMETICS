/**
 * Product reviews: public submission (moderated) + display, admin moderation.
 * New reviews land as `pending` and only appear publicly once approved.
 */
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { reviews } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";

export const reviewsRouter = router({
  // Approved reviews for a product (public).
  listForProduct: publicProcedure
    .input(z.object({ productSlug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(reviews)
        .where(and(eq(reviews.productSlug, input.productSlug), eq(reviews.status, "approved")))
        .orderBy(desc(reviews.createdAt))
        .limit(50);
    }),

  // Aggregate rating for a product (public).
  summary: publicProcedure
    .input(z.object({ productSlug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { count: 0, average: 0 };
      const [row] = await db
        .select({ count: sql<number>`COUNT(*)`, avg: sql<number>`AVG(${reviews.rating})` })
        .from(reviews)
        .where(and(eq(reviews.productSlug, input.productSlug), eq(reviews.status, "approved")));
      return { count: Number(row?.count ?? 0), average: row?.avg ? Math.round(Number(row.avg) * 10) / 10 : 0 };
    }),

  // Featured approved reviews across products (public — homepage).
  featured: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(12).default(6) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(reviews)
        .where(eq(reviews.status, "approved"))
        .orderBy(desc(reviews.createdAt))
        .limit(input?.limit ?? 6);
    }),

  // Submit a review (public). Lands as pending for moderation.
  submit: publicProcedure
    .input(
      z.object({
        productSlug: z.string().min(1).max(128),
        customerName: z.string().min(1).max(128).trim(),
        location: z.string().max(128).trim().optional(),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(200).trim().optional(),
        body: z.string().min(4).max(4000).trim(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.insert(reviews).values({ ...input, status: "pending" });
      notifyOwner({ title: "New product review (pending)", content: `${input.rating}★ for ${input.productSlug} by ${input.customerName}\n\n${input.body.slice(0, 300)}` }).catch(() => {});
      return { ok: true };
    }),

  // ── Admin moderation ────────────────────────────────────────────────────
  adminList: adminProcedure
    .input(z.object({ status: z.enum(["pending", "approved", "rejected", "all"]).default("pending") }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const status = input?.status ?? "pending";
      let q = db.select().from(reviews).$dynamic();
      if (status !== "all") q = q.where(eq(reviews.status, status));
      return q.orderBy(desc(reviews.createdAt)).limit(200);
    }),

  moderate: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["approved", "rejected", "pending"]), verified: z.boolean().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.update(reviews).set({ status: input.status, ...(input.verified !== undefined ? { verified: input.verified } : {}) }).where(eq(reviews.id, input.id));
      return { ok: true };
    }),

  remove: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await db.delete(reviews).where(eq(reviews.id, input.id));
    return { ok: true };
  }),
});
