/**
 * Effective analytics configuration.
 *
 * The registry (shared/analytics/registry.ts) defines defaults; the
 * `analyticsConfig` table holds runtime overrides set by an admin. This module
 * merges the two so collection can be enabled/disabled per-module WITHOUT a
 * redeploy — satisfying the "modular and configurable" requirement.
 */
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { analyticsConfig } from "../../drizzle/schema";
import {
  ANALYTICS_MODULES,
  MODULE_BY_ID,
  MODULE_BY_EVENT,
  type AnalyticsModule,
} from "../../shared/analytics/registry";

export interface EffectiveModule extends AnalyticsModule {
  enabled: boolean;
  overridden: boolean;
}

/** Returns every module with its effective enabled state. */
export async function getEffectiveModules(): Promise<EffectiveModule[]> {
  const db = await getDb();
  const overrides = new Map<string, boolean>();
  if (db) {
    try {
      const rows = await db.select().from(analyticsConfig);
      for (const r of rows) overrides.set(r.moduleId, r.enabled);
    } catch {
      /* table may not exist yet — fall back to defaults */
    }
  }
  return ANALYTICS_MODULES.map(m => ({
    ...m,
    enabled: overrides.has(m.id) ? overrides.get(m.id)! : m.defaultEnabled,
    overridden: overrides.has(m.id),
  }));
}

/** Is a specific module currently collecting? */
export async function isModuleEnabled(moduleId: string): Promise<boolean> {
  const mod = MODULE_BY_ID[moduleId];
  if (!mod) return false;
  const db = await getDb();
  if (db) {
    try {
      const [row] = await db
        .select()
        .from(analyticsConfig)
        .where(eq(analyticsConfig.moduleId, moduleId))
        .limit(1);
      if (row) return row.enabled;
    } catch {
      /* ignore */
    }
  }
  return mod.defaultEnabled;
}

/** Resolve the owning module for an event type (or undefined if unknown). */
export function moduleForEvent(eventType: string): AnalyticsModule | undefined {
  return MODULE_BY_EVENT[eventType];
}

/** Set a runtime override for a module. */
export async function setModuleEnabled(
  moduleId: string,
  enabled: boolean,
  updatedBy?: string,
): Promise<void> {
  if (!MODULE_BY_ID[moduleId]) throw new Error(`Unknown analytics module: ${moduleId}`);
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(analyticsConfig)
    .values({ moduleId, enabled, updatedBy })
    .onDuplicateKeyUpdate({ set: { enabled, updatedBy, updatedAt: new Date() } });
}
