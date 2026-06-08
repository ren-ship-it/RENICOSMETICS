/**
 * Stockist data (presentational defaults / seed source).
 *
 * The storefront prefers DB-backed stockists (admin-managed) and falls back to
 * this list when the table is empty. `scripts/seedContent.ts` seeds the DB from
 * the flattened list so the owner can manage stockists in admin.
 */
export interface StoreEntry {
  name: string;
  type: string;
  location: string;
  url: string;
  online: boolean;
}

export interface StockistRegion {
  region: string;
  stores: StoreEntry[];
}

export const STOCKISTS: StockistRegion[] = [
  {
    region: "Victoria",
    stores: [
      { name: "The Skin Science Company", type: "Online / Wholesale", location: "Epping, VIC", url: "https://theskinsciencecompany.com.au", online: true },
      { name: "Reni Cosmetics Direct", type: "Online Flagship", location: "renicosmetics.com.au", url: "https://renicosmetics.com.au", online: true },
    ],
  },
];

export const COMING_SOON_REGIONS = [
  { region: "New South Wales", eta: "Q2 2026" },
  { region: "Queensland", eta: "Q2 2026" },
  { region: "South Australia", eta: "Q3 2026" },
  { region: "Western Australia", eta: "Q3 2026" },
  { region: "New Zealand", eta: "Q4 2026" },
  { region: "United Kingdom", eta: "Q4 2026" },
];

/** Flatten regions to rows for seeding/admin (region carried on each row). */
export function flattenStockists() {
  const rows: Array<StoreEntry & { region: string; sortOrder: number }> = [];
  let order = 0;
  for (const r of STOCKISTS) {
    for (const s of r.stores) rows.push({ ...s, region: r.region, sortOrder: order++ });
  }
  return rows;
}

/** Group flat DB rows back into regions for display. */
export function groupStockists(
  rows: Array<{ name: string; type: string | null; region: string | null; location: string | null; url: string | null; online: boolean }>,
): StockistRegion[] {
  const byRegion = new Map<string, StoreEntry[]>();
  for (const r of rows) {
    const region = r.region || "Other";
    const list = byRegion.get(region) ?? [];
    list.push({ name: r.name, type: r.type ?? "", location: r.location ?? "", url: r.url ?? "", online: r.online });
    byRegion.set(region, list);
  }
  return Array.from(byRegion.entries()).map(([region, stores]) => ({ region, stores }));
}
