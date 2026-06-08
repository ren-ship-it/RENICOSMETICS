/**
 * Media library: admin image uploads to object storage (reuses server/storage).
 * Stores the resulting URL in `mediaAssets` so the admin can browse/copy them
 * into product, journal, or other image fields.
 */
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { mediaAssets } from "../../drizzle/schema";
import { storagePut } from "server/storage";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB (matches the body parser limit)

export const mediaRouter = router({
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(100);
  }),

  upload: adminProcedure
    .input(
      z.object({
        filename: z.string().min(1).max(200),
        contentType: z.string().min(1).max(128),
        dataBase64: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      if (!/^image\//.test(input.contentType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only image uploads are allowed." });
      }
      const buffer = Buffer.from(input.dataBase64, "base64");
      if (buffer.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Empty file." });
      if (buffer.length > MAX_BYTES) throw new TRPCError({ code: "BAD_REQUEST", message: "Image exceeds 5MB. Please optimise it first." });

      const safe = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
      const key = `media/${Date.now()}-${safe}`;
      let url: string;
      try {
        ({ url } = await storagePut(key, buffer, input.contentType));
      } catch (e) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Upload failed: ${e instanceof Error ? e.message : "storage error"}` });
      }

      const db = await getDb();
      if (db) {
        await db.insert(mediaAssets).values({ url, filename: safe, contentType: input.contentType }).catch(() => {});
      }
      return { url };
    }),

  remove: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    // Removes the library reference; the stored object is left in place.
    await db.delete(mediaAssets).where(eq(mediaAssets.id, input.id));
    return { ok: true };
  }),
});
