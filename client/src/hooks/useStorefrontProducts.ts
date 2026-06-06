/**
 * Storefront product catalogue with the DATABASE as the source of truth.
 *
 * The static catalogue (client/src/data/products.ts) provides rich
 * presentational defaults; live DB rows override the mutable, admin-editable
 * fields (price, availability, stock, images, copy). If the DB is empty or
 * unreachable, the storefront falls back to the static catalogue, so it never
 * breaks. Admin edits therefore propagate to the storefront automatically.
 */
import { useMemo } from "react";
import { PRODUCTS, type Product, type Active } from "@/data/products";
import { trpc } from "@/lib/trpc";

export type StorefrontProduct = Product & { stockQty?: number };

function formatPrice(value: unknown, fallback: string): string {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  if (Number.isNaN(n)) return fallback;
  return `$${n.toFixed(2)} AUD`;
}

type DbProduct = {
  slug: string;
  name: string;
  tagline: string | null;
  pathway: string | null;
  format: string | null;
  size: string | null;
  price: string | null;
  available: boolean | null;
  image: string | null;
  hoverImage: string | null;
  badge: string | null;
  description: string | null;
  howToUse: string | null;
  fullInci: string | null;
  heroActives: unknown;
  phase: number | null;
  stockQty: number;
};

function isAvailable(db: Pick<DbProduct, "available" | "stockQty">): boolean {
  // Sold out (zero stock) renders as unavailable so the waitlist/notify flow shows.
  return db.available !== false && db.stockQty > 0;
}

function merge(base: Product, db: DbProduct | undefined): StorefrontProduct {
  if (!db) return base;
  const heroActives =
    Array.isArray(db.heroActives) && db.heroActives.length
      ? (db.heroActives as Active[])
      : base.heroActives;
  return {
    ...base,
    name: db.name || base.name,
    tagline: db.tagline || base.tagline,
    pathway: db.pathway || base.pathway,
    format: db.format || base.format,
    size: db.size || base.size,
    price: formatPrice(db.price, base.price),
    available: isAvailable(db),
    image: db.image || base.image,
    hoverImage: db.hoverImage || base.hoverImage,
    badge: db.badge ?? base.badge,
    description: db.description || base.description,
    howToUse: db.howToUse || base.howToUse,
    fullInci: db.fullInci || base.fullInci,
    heroActives,
    stockQty: db.stockQty,
  };
}

/** Build a Product from a DB-only row (created in admin, not in the static set). */
function fromDb(db: DbProduct): StorefrontProduct {
  return {
    id: db.slug,
    slug: db.slug,
    name: db.name,
    tagline: db.tagline ?? "",
    pathway: db.pathway ?? "",
    format: db.format ?? "",
    size: db.size ?? "",
    price: formatPrice(db.price, "$0.00 AUD"),
    phase: (db.phase === 2 ? 2 : 1),
    available: isAvailable(db),
    image: db.image ?? "",
    hoverImage: db.hoverImage ?? undefined,
    heroActives: Array.isArray(db.heroActives) ? (db.heroActives as Active[]) : [],
    howToUse: db.howToUse ?? "",
    fullInci: db.fullInci ?? "",
    description: db.description ?? "",
    badge: db.badge ?? undefined,
    stockQty: db.stockQty,
  };
}

export function useStorefrontProducts() {
  const query = trpc.products.listPublic.useQuery(undefined, { staleTime: 30_000 });

  const products = useMemo<StorefrontProduct[]>(() => {
    const rows = (query.data ?? []) as unknown as DbProduct[];
    const bySlug = new Map(rows.map(r => [r.slug, r]));
    const staticSlugs = new Set(PRODUCTS.map(p => p.slug));
    const merged = PRODUCTS.map(base => merge(base, bySlug.get(base.slug)));
    const dbOnly = rows.filter(r => !staticSlugs.has(r.slug)).map(fromDb);
    return [...merged, ...dbOnly];
  }, [query.data]);

  const bySlug = useMemo(() => new Map(products.map(p => [p.slug, p])), [products]);

  return { products, bySlug, isLoading: query.isLoading, isError: query.isError };
}
