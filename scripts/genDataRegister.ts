/**
 * Generates docs/DATA_COLLECTION_REGISTER.md from the analytics registry.
 *
 * Run: pnpm tsx scripts/genDataRegister.ts
 *
 * Keeping the internal Data Collection Register generated from the single source
 * of truth means it can never drift from what the platform actually collects
 * (APP 1 accountability). Re-run this whenever shared/analytics/registry.ts
 * changes.
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  ANALYTICS_MODULES,
  POLICY_VERSION,
  modulesByClassification,
  automatedDecisionModules,
} from "../shared/analytics/registry";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "docs", "DATA_COLLECTION_REGISTER.md");

const esc = (s: string) => s.replace(/\|/g, "\\|");

const lines: string[] = [];
lines.push("# Reni Cosmetics — Internal Data Collection Register");
lines.push("");
lines.push("> GENERATED FILE — do not edit by hand.");
lines.push("> Source: `shared/analytics/registry.ts`. Regenerate: `pnpm tsx scripts/genDataRegister.ts`.");
lines.push("");
lines.push(`Policy/registry version: **${POLICY_VERSION}**`);
lines.push("");
lines.push(
  "This is the internal record of processing activities (akin to a GDPR Art. 30 register, scoped to the Australian Privacy Act / APPs). It documents, for every data-collection module, its purpose, lawful basis, data classification, consent requirement, retention and whether it feeds automated decision-making.",
);
lines.push("");

lines.push("## Summary");
lines.push("");
lines.push(`- Total modules: **${ANALYTICS_MODULES.length}**`);
lines.push(`- Identified: ${modulesByClassification("identified").length} · Pseudonymised: ${modulesByClassification("pseudonymised").length} · Aggregated: ${modulesByClassification("aggregated").length}`);
lines.push(`- Feeding automated decision-making: ${automatedDecisionModules().length} (${automatedDecisionModules().map(m => m.label).join(", ")})`);
lines.push("");

lines.push("## Register");
lines.push("");
lines.push("| Module | Purpose | Classification | Consent | Lawful basis | Retention | ADM |");
lines.push("|---|---|---|---|---|---|---|");
for (const m of ANALYTICS_MODULES) {
  const retention = m.retentionDays === null ? "derived/aggregated" : `${m.retentionDays} days`;
  lines.push(
    `| ${esc(m.label)} | ${m.purpose} | ${m.classification} | ${m.consent} | ${esc(m.lawfulBasis)} | ${retention} | ${m.automatedDecisioning ? "yes" : "no"} |`,
  );
}
lines.push("");

lines.push("## Detail");
lines.push("");
for (const m of ANALYTICS_MODULES) {
  lines.push(`### ${m.label} (\`${m.id}\`)`);
  lines.push("");
  lines.push(`- **What is collected:** ${m.description}`);
  lines.push(`- **Public-facing summary:** ${m.publicSummary}`);
  lines.push(`- **Purpose:** ${m.purpose}`);
  lines.push(`- **Classification:** ${m.classification}`);
  lines.push(`- **Consent category:** ${m.consent}`);
  lines.push(`- **Lawful basis:** ${m.lawfulBasis}`);
  lines.push(`- **Event types:** ${m.eventTypes.length ? m.eventTypes.join(", ") : "(derived — no client events)"}`);
  lines.push(`- **Data points:** ${m.dataPoints.join(", ")}`);
  lines.push(`- **Retention:** ${m.retentionDays === null ? "derived/aggregated; governed by source-record retention" : `${m.retentionDays} days`}`);
  lines.push(`- **Default enabled:** ${m.defaultEnabled ? "yes" : "no"}`);
  lines.push(`- **Sidekick access:** ${m.sidekickAccess}`);
  lines.push(`- **Automated decision-making:** ${m.automatedDecisioning ? "yes — see docs/AI_AND_AUTOMATED_DECISIONS.md" : "no"}`);
  lines.push("");
}

writeFileSync(out, lines.join("\n"));
console.log(`Wrote ${out}`);
