/**
 * Seed Journal posts and Stockists into the DB from the static content, so the
 * existing articles/stockists become editable in admin.
 *
 * Usage: pnpm seed:content
 *
 * Journal posts upsert by slug (safe to re-run). Stockists are inserted only if
 * the table is empty (no natural unique key), to avoid duplicates on re-run.
 */
import "dotenv/config";
import { count } from "drizzle-orm";
import { getDb } from "../server/db";
import { journalPosts, stockists } from "../drizzle/schema";
import { ARTICLES } from "../client/src/data/journal";
import { flattenStockists } from "../client/src/data/stockists";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  const db = await getDb();
  if (!db) {
    console.error("Database unavailable.");
    process.exit(1);
  }

  for (const a of ARTICLES) {
    const row = {
      slug: a.id,
      title: a.title,
      category: a.category,
      excerpt: a.excerpt,
      content: a.body.join("\n\n"),
      image: a.image,
      readTime: a.readTime,
      relatedProductSlugs: a.relatedProductIds,
      status: "published" as const,
      publishedAt: new Date(),
    };
    const { slug, ...rest } = row;
    await db.insert(journalPosts).values(row).onDuplicateKeyUpdate({ set: rest });
    console.log(`journal: ${a.id}`);
  }

  const [{ c } = { c: 0 }] = await db.select({ c: count() }).from(stockists);
  if (Number(c) === 0) {
    for (const s of flattenStockists()) {
      await db.insert(stockists).values({
        name: s.name,
        type: s.type,
        region: s.region,
        location: s.location,
        url: s.url,
        online: s.online,
        active: true,
        sortOrder: s.sortOrder,
      });
      console.log(`stockist: ${s.name}`);
    }
  } else {
    console.log(`stockists: ${c} rows already present, skipping insert`);
  }

  console.log("Content seed complete.");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
