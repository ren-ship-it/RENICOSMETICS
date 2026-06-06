/**
 * Seed / sync the products table from the static catalogue.
 *
 * Usage: pnpm seed:products
 *
 * The DB is the storefront source of truth; this script seeds it from the
 * curated static catalogue. Re-running updates presentational fields but
 * PRESERVES admin-managed stock (stockQty is only set on first insert).
 */
import "dotenv/config";
import { getDb } from "../server/db";
import { products } from "../drizzle/schema";
import { PRODUCTS } from "../client/src/data/products";

function toDecimal(price: string): string {
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isNaN(n) ? "0.00" : n.toFixed(2);
}

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

  for (const p of PRODUCTS) {
    const presentational = {
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      pathway: p.pathway,
      format: p.format,
      size: p.size,
      price: toDecimal(p.price),
      available: p.available,
      image: p.image,
      hoverImage: p.hoverImage,
      badge: p.badge,
      howToUse: p.howToUse,
      fullInci: p.fullInci,
      heroActives: p.heroActives,
      phase: p.phase,
    };
    await db
      .insert(products)
      .values({ ...presentational, stockQty: 100 }) // initial stock on first seed only
      .onDuplicateKeyUpdate({ set: presentational }); // never clobber admin stock
    console.log(`seeded ${p.slug}`);
  }
  console.log(`Done. ${PRODUCTS.length} products synced.`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
