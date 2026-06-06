# Reni Cosmetics — Analytics & Intelligence Architecture

This document describes the privacy-aware, modular analytics and business-
intelligence layer added to the Reni Cosmetics platform. It is the engineering
companion to the public Privacy Policy and the internal Data Collection Register.

## Goals

A Shopify/Klaviyo/Meta-style intelligence layer that:

1. Maximises useful business intelligence.
2. Stays compliant with the Australian Privacy Act 1988 (Cth), the 13 APPs, the
   Spam Act 2003 (Cth), and the direction of the 2024–2026 Privacy Act reforms.
3. Is modular and configurable — new analytics modules slot in with no backend
   restructuring, and any module can be switched off at runtime.
4. Distinguishes identified, pseudonymised and aggregated data, and keeps data
   in the least-identifying tier that still serves the purpose.

## The single source of truth

`shared/analytics/registry.ts` defines every collection concern as a self-
describing **module**: purpose, lawful basis, data classification, consent
category, event types, retention, default state and Sidekick access. Because it
is dependency-free it is imported by:

- the **server** (ingestion gating, config, documentation generator),
- the **Privacy Policy page** (so disclosures are generated from real behaviour),
- the **cookie/consent UI** and client tracking (consent gating),
- the **Data Collection Register** generator (`scripts/genDataRegister.ts`).

Change a module once; the policy, the register, the consent UI and the server
gate all update together. This directly satisfies requirements 1, 2, 4 and 5.

## Data classification tiers

| Tier | Keyed by | Examples | Used for |
|---|---|---|---|
| **Identified** | customer id / email | orders, waitlist, segmentation, churn | fulfilment, support, retention |
| **Pseudonymised** | random `visitorId` / `sessionId` | page views, product views, search, cart events, device/coarse-geo | UX & product analytics |
| **Aggregated** | nothing (counts/rates) | funnels, conversion rates, support themes, demand forecasts | reporting, the AI assistant |

- IP addresses are **never stored raw** — only a salted HMAC hash (`ipHash`) and
  coarse geo (country/state from edge headers).
- `visitorId` is a random id in `localStorage`; it is not derived from any
  personal data and can be reset.

## Components

```
shared/analytics/registry.ts      Single source of truth (modules, consent, tiers)

server/analytics/
  pseudonymise.ts                 IP hashing, UA parsing, coarse geo
  config.ts                       Registry + DB runtime overrides (enable/disable)
  queries.ts                      Event ingestion + aggregated reads
  models/
    rfm.ts                        RFM segmentation
    churn.ts                      Transparent logistic churn scorer (explainable)
    forecast.ts                   Holt's linear demand forecasting + reorder
    recommendations.ts            Item-item collaborative filtering
  insights.ts                     Runs models on live data; persists ADM outputs
  sidekick.ts                     Aggregated business snapshot + LLM context
  alerts.ts                       Proactive prioritised alerts engine
  decisionLog.ts                  AI / automated-decision transparency logger
  router.ts                       tRPC surface (ingest, consent, config, BI, ask)

client/src/
  lib/visitor.ts                  Pseudonymous visitor/session ids
  lib/consent.ts                  Consent store + server ledger + broadcast
  lib/track.ts                    Consent-gated first-party tracking (+GA4 mirror)
  hooks/useAnalytics.ts           Ergonomic tracking hook (back-compatible API)
  hooks/useConsent.ts             Reactive consent state
  components/CookieConsent.tsx    4-category consent banner (re-openable)
  pages/admin/AdminIntelligence.tsx  Admin AI dashboard (Ask AI, alerts, BI, config)
  pages/PrivacyPage.tsx           Policy generated from the registry

drizzle/schema.ts                 analyticsEvents, consentRecords, analyticsConfig,
                                  customerInsights, aiDecisionLog
```

## Consent flow (requirement 3)

1. First visit → `CookieConsent` banner (essential always on; analytics,
   marketing, personalisation opt-in).
2. Choice is stored in `localStorage` (instant gating) **and** written to the
   append-only `consentRecords` ledger via `analytics.recordConsent` with the
   policy version, source, hashed IP and user agent.
3. `client/src/lib/track.ts` checks consent before sending any event.
4. The server **re-checks** consent on ingestion (`analytics.track`) against the
   owning module's required category. The server is the authoritative gate.
5. Visitors can reopen preferences anytime via the footer (dispatches
   `reni:open-consent`).

## Ingestion pipeline

`client track()` → `analytics.track` (tRPC) → validates event against registry
allow-list → checks module enabled (runtime config) → checks consent →
enriches with server-derived device/geo/ipHash → drops bots → inserts a row in
`analyticsEvents` with a consent snapshot.

Unknown event types are dropped (allow-list), so the client cannot write
arbitrary data.

## Models / ML (requirement: predictive analytics)

All models are deterministic, explainable TypeScript — no opaque black box,
which matters for ADM contestability:

- **RFM segmentation** (`rfm.ts`): quantile R/F/M scores → standard segments.
- **Churn** (`churn.ts`): logistic scorer over interpretable features; the key
  driver is recency vs the customer's *own* purchase cadence. Every score ships
  with its feature contributions.
- **Forecasting** (`forecast.ts`): Holt's linear (double exponential smoothing)
  with a moving-average fallback; outputs days-of-cover and a reorder quantity.
- **Recommendations** (`recommendations.ts`): cosine item-item collaborative
  filtering over co-purchase baskets.

`insights.ts` runs these on live orders and persists per-customer results to
`customerInsights` (with explanation factors) and a batch entry to
`aiDecisionLog`.

## Sidekick / AI business assistant (requirement 6)

- `sidekick.ts` builds an **aggregated** snapshot (no individual rows) and a
  compact factual text context.
- The admin `analytics.ask` procedure feeds that context to the LLM with a
  hardened system prompt: answer only from the data, never fabricate, label
  facts vs interpretation vs unknown, refuse injection, propose-not-perform.
- Identified reads (e.g. `insights.atRiskCustomers`) are separate admin-only
  procedures and are **never** placed in the AI's aggregated context.
- The consumer chatbot and the admin assistant are entirely separate routers,
  prompts and permission levels (`publicProcedure` vs `adminProcedure`).

## Reactivity & cascading (foundation)

- Admin module toggles (`analyticsConfig`) take effect immediately on the next
  ingest/read — no redeploy.
- The dashboard uses TanStack Query; mutations invalidate the relevant queries
  so the UI refreshes automatically.
- `aiDecisionLog` and `consentRecords` are append-only, giving an audit trail.
- Order/stock/customer changes flow into the snapshot and alerts on next read.
  A future enhancement is to recompute `customerInsights` on the Stripe webhook
  and emit alerts on a schedule (hooks are in place: `recomputeCustomerInsights`,
  `deriveAlerts`).

## Future-compliance hooks (requirement 7)

- `aiDecisionLog` records every AI output / automated decision with disclosure
  and human-review flags — ready for the ADM transparency reforms.
- `consentRecords` is versioned against `POLICY_VERSION` so consent can be
  re-collected when the policy materially changes.
- The registry's `automatedDecisioning` flag drives the Privacy Policy's ADM
  disclosure automatically.

## Operational notes

- Schema changes are applied with `pnpm db:push` (Drizzle). New tables:
  `analyticsEvents`, `consentRecords`, `analyticsConfig`, `customerInsights`,
  `aiDecisionLog`.
- Regenerate the register after registry changes:
  `pnpm tsx scripts/genDataRegister.ts` (also wired as `pnpm gen:register`).
- GA4 remains **optional**. First-party analytics work without it; if a GA4 id is
  configured, key ecommerce events mirror to GA4 only with analytics consent.
