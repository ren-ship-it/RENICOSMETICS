/**
 * Content router: admin-managed Journal posts and Stockists.
 *
 * Public procedures read published/active content for the storefront; admin
 * procedures provide full CRUD with draft/published/archived states. The DB is
 * the source of truth; the storefront falls back to static content if empty.
 */
import { z } from "zod";
import { and, asc, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { journalPosts, stockists } from "../../drizzle/schema";

const journalInput = z.object({
  id: z.number().optional(),
  slug: z.string().min(1).max(160),
  title: z.string().min(1).max(256),
  category: z.string().max(64).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
  author: z.string().max(128).optional(),
  readTime: z.string().max(32).optional(),
  relatedProductSlugs: z.array(z.string()).optional(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

const stockistInput = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(256),
  type: z.string().max(128).optional(),
  region: z.string().max(128).optional(),
  location: z.string().max(256).optional(),
  url: z.string().max(2048).optional(),
  online: z.boolean().default(false),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const contentRouter = router({
  // ── Journal (public) ────────────────────────────────────────────────────
  journalList: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(journalPosts)
      .where(eq(journalPosts.status, "published"))
      .orderBy(desc(journalPosts.publishedAt), desc(journalPosts.createdAt));
  }),

  journalBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return undefined;
      const [post] = await db
        .select()
        .from(journalPosts)
        .where(and(eq(journalPosts.slug, input.slug), eq(journalPosts.status, "published")))
        .limit(1);
      return post;
    }),

  // ── Stockists (public) ──────────────────────────────────────────────────
  stockistsList: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(stockists)
      .where(eq(stockists.active, true))
      .orderBy(asc(stockists.sortOrder), asc(stockists.name));
  }),

  // ── Journal (admin CRUD) ────────────────────────────────────────────────
  journalAdminList: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(journalPosts).orderBy(desc(journalPosts.updatedAt));
  }),

  journalSave: adminProcedure.input(journalInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { id, ...data } = input;
    const values = {
      ...data,
      publishedAt: data.status === "published" ? new Date() : null,
    };
    if (id) {
      await db.update(journalPosts).set(values).where(eq(journalPosts.id, id));
    } else {
      await db.insert(journalPosts).values(values);
    }
    return { ok: true };
  }),

  journalDelete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await db.delete(journalPosts).where(eq(journalPosts.id, input.id));
    return { ok: true };
  }),

  // ── Stockists (admin CRUD) ──────────────────────────────────────────────
  stockistAdminList: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(stockists).orderBy(asc(stockists.sortOrder), asc(stockists.name));
  }),

  stockistSave: adminProcedure.input(stockistInput).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { id, ...data } = input;
    if (id) {
      await db.update(stockists).set(data).where(eq(stockists.id, id));
    } else {
      await db.insert(stockists).values(data);
    }
    return { ok: true };
  }),

  stockistDelete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await db.delete(stockists).where(eq(stockists.id, input.id));
    return { ok: true };
  }),
});
