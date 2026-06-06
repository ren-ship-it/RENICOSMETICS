# Reni Cosmetics — Platform Audit & Prioritised Action Plan

Prepared: 2026-06-06. Reviewer: engineering. Method: full read of the committed
source (frontend, backend, tRPC routers, Drizzle schema, server core, admin
panel) plus a gap/assumption audit per the brief.

## How to read this

Issues are grouped by the 13 priority bands in the brief, highest risk first.
Each item uses the requested format. Status tags:

- **[DONE]** implemented in this branch (`claude/privacy-analytics-platform-RFGDO`).
- **[PARTIAL]** foundation in place; remaining work noted.
- **[TODO]** not yet started.

> Work order: do not jump around. Start at Priority 1 and descend. Priorities 8,
> 9 and most of 10 are already implemented (analytics/intelligence layer, privacy
> & consent, AI guardrails) and are documented in `docs/ANALYTICS_ARCHITECTURE.md`,
> `docs/AI_AND_AUTOMATED_DECISIONS.md` and `docs/AI_SAFETY_TEST_REPORT.md`.

---

## Priority 1 — Critical blockers

### 1.1 Orders are never created after payment [TODO]
- **Issue:** There is no Stripe webhook handler. `server/_core/index.ts` mounts
  tRPC and OAuth but no `/api/stripe/webhook` route, even though
  `checkout.createSession` sets `success_url`/webhook metadata and `db.createOrder`
  / `db.upsertCustomer` exist. Payments can succeed with **no order, customer,
  stock decrement, or confirmation** being recorded.
- **Why it matters:** The business cannot fulfil or even see paid orders. This is
  a revenue-and-trust-critical data-loss bug.
- **Recommended fix:** Add a raw-body `/api/stripe/webhook` Express route BEFORE
  the JSON body parser, verify the signature with `STRIPE_WEBHOOK_SECRET`, and on
  `checkout.session.completed` call `db.createOrder` + `db.upsertCustomer`,
  decrement stock, trigger confirmation email, and recompute insights.
- **Files:** `server/_core/index.ts`, `server/routers.ts` (checkout), `server/db.ts`.
- **Risk if ignored:** Paid orders silently lost; no fulfilment; chargebacks.

### 1.2 Stripe client crashes at module load without a key [PARTIAL]
- **Issue:** `server/routers.ts:14` runs `new Stripe(process.env.STRIPE_SECRET_KEY ?? "")`
  at import time. Stripe v22 throws "Neither apiKey nor config provided" when the
  key is empty, which crashes server boot and breaks the test suite
  (`auth.logout.test.ts` fails for this reason, unrelated to the analytics work).
- **Why it matters:** Any environment without the key (CI, local, tests) cannot
  import the router at all.
- **Recommended fix:** Lazily construct Stripe inside the procedures, or guard
  with a clear startup error only when checkout is actually used.
- **Files:** `server/routers.ts`.
- **Risk if ignored:** Fragile boot; red CI; hard-to-debug failures.

### 1.3 Stock is not decremented on sale [TODO]
- **Issue:** `stockQty` only changes via admin `adjustStock`. Nothing reduces it
  on purchase (compounded by 1.1).
- **Why it matters:** Inventory, low-stock alerts, waitlist logic and demand
  forecasts are all wrong without it.
- **Recommended fix:** Decrement stock in the webhook order handler; flip
  `available`/notify waitlist at zero.
- **Files:** `server/db.ts`, webhook handler.
- **Risk if ignored:** Overselling; inaccurate intelligence.

---

## Priority 2 — Security & access control

### 2.1 No customer authentication system [TODO]
- **Issue:** Auth is Manus OAuth for admins only. There is no customer account
  system at all (the brief requires signup, login/logout, password reset, order
  history, saved details, communication/marketing preferences).
- **Why it matters:** Core ecommerce functionality and a compliance surface
  (consent/preferences) are missing.
- **Recommended fix:** Add a `customers` auth flow: password hashing (argon2/
  bcrypt), JWT/session via the existing `jose` setup, protected customer routes,
  RBAC (`user` vs `admin` already in `users` enum), rate-limited login, password
  reset tokens, MFA-ready schema. Build branded UI (see Priority 7).
- **Files:** new `server/auth/*`, `drizzle/schema.ts`, `client/src/pages/account/*`.
- **Risk if ignored:** No accounts, no order history, weak retention, manual support.

### 2.2 CSP disabled; CSRF posture unverified [PARTIAL]
- **Issue:** `helmet({ contentSecurityPolicy: false })` in
  `server/_core/index.ts`. tRPC is cookie-authed (`credentials: include`) — CSRF
  needs review for mutations.
- **Why it matters:** XSS/CSRF exposure on an authenticated admin surface.
- **Recommended fix:** Enable a tuned CSP; add SameSite=strict/lax on the session
  cookie (verify `cookies.ts`); add a CSRF token or origin check for cookie-authed
  mutations.
- **Files:** `server/_core/index.ts`, `server/_core/cookies.ts`.
- **Risk if ignored:** Account/admin compromise.

### 2.3 Brute-force protection only on chat [PARTIAL]
- **Issue:** Global + chat rate limits exist; once customer login lands it needs
  its own strict limiter and lockout.
- **Recommended fix:** Add a per-account/IP login limiter and exponential backoff.
- **Files:** `server/_core/index.ts`, future auth router.

### 2.4 Admin AI / analytics endpoints — access [DONE]
- **Status:** `analytics.*` admin endpoints use `adminProcedure` (403 for
  non-admins); ingestion/consent endpoints are public by design and consent-gated;
  identified reads (`insights.atRiskCustomers`) are admin-only and excluded from
  the AI context. See `docs/AI_SAFETY_TEST_REPORT.md`.

---

## Priority 3 — Database & source-of-truth

### 3.1 Hardcoded product data competes with the DB [TODO]
- **Issue:** `client/src/data/products.ts` holds static product data used for
  rendering, while a `products` DB table + admin CRUD also exist. Two sources of
  truth.
- **Why it matters:** Admin edits won't reliably reflect on the storefront;
  price/stock/SEO can diverge.
- **Recommended fix:** Make the DB the single source; have product pages/grids
  read via tRPC (`products.bySlug`, a new `products.listPublic`), keep the static
  file only as a seed/migration.
- **Files:** `client/src/data/products.ts`, product pages/components, `server/routers.ts`.
- **Risk if ignored:** Inconsistent storefront; cascading-update goals unmet.

### 3.2 Other content not DB-backed [TODO]
- **Issue:** Stockists, journal articles, reviews, layering guide are static/empty.
- **Recommended fix:** Add tables + admin CRUD, or clearly mark as intentionally
  static. (See Priority 6 & content.)

---

## Priority 4 — Ecommerce, checkout, forms, core flows

### 4.1 Order lifecycle incomplete [TODO]
- **Issue:** Beyond 1.1, there are no order confirmation emails, no customer-
  facing order history, and refund/cancel only flips a status enum.
- **Recommended fix:** Wire confirmation emails (Priority 11), customer order
  history (Priority 2.1), and refund handling via Stripe.
- **Files:** webhook, `server/db.ts`, account pages, email layer.

### 4.2 Forms fall back silently when EmailJS is unset [PARTIAL]
- **Issue:** Contact/newsletter/notify-me use client-side EmailJS with unset keys;
  data is saved to DB but owner notifications won't fire, and client-side email
  exposes template ids.
- **Recommended fix:** Move transactional email server-side (Priority 11);
  give every form explicit loading/success/error states.
- **Files:** `client/src/components/NotifyMeModal.tsx`, contact/newsletter, server.

### 4.3 Free-shipping/threshold messaging inconsistent [TODO]
- **Issue:** Free-shipping over $80 (chat KB) vs `subtotal >= 150` in
  `checkout.createSession`; minimum order $150 vs $80 elsewhere. Conflicting rules.
- **Recommended fix:** Centralise shipping/threshold rules server-side and surface
  consistently (announcement bar, cart, product, checkout).
- **Files:** `server/routers.ts` (checkout), cart/checkout UI, announcement bar.
- **Risk if ignored:** Customer confusion, disputes.

---

## Priority 5 — Cascading & reactive behaviour [PARTIAL]
- **Issue:** Few changes propagate automatically: no webhook → no downstream
  cascade; stock changes don't refresh availability/waitlist/AI context; product
  edits don't refresh SEO/schema.
- **Why it matters:** The brief wants an interconnected SaaS, not isolated CRUD.
- **Recommended fix:** Introduce a lightweight domain-event bus (e.g.
  `order.paid`, `stock.changed`, `product.updated`) with handlers that decrement
  stock, notify waitlist, recompute `customerInsights` (hook already exists:
  `recomputeCustomerInsights`), emit alerts (`deriveAlerts`), and invalidate
  caches/queries. The analytics layer already refreshes via TanStack Query
  invalidation and reads live snapshots on demand.
- **Files:** new `server/events/*`, webhook, `server/analytics/insights.ts`.
- **Status:** Analytics/insights/alerts recompute is built; event wiring is TODO.

---

## Priority 6 — Admin panel functionality [PARTIAL]
- **Issue:** Products/orders/customers/messages/subscribers/chat-logs admin exist.
  Missing: content management for stockists/journal/reviews/pages; media/image
  management; draft/live/archive states; AI-edit approval flow.
- **Recommended fix:** Add CRUD + status (`draft`/`live`/`archived`) for content
  entities; an S3-backed media manager (S3 helper exists in `_core`); and an
  approval queue for AI-proposed edits (ties to Priority 10's propose-only model).
- **Files:** `client/src/pages/admin/*`, `server/routers.ts`, `drizzle/schema.ts`.
- **Status (new):** Admin **Intelligence** dashboard added (`/admin/intelligence`)
  with Ask AI, alerts, BI insights, ML outputs and a runtime data-collection
  module toggle.

---

## Priority 7 — Branding & authentication (de-white-label) [TODO]
- **Issue:** Admin auth is **Manus OAuth** (third-party). The brief forbids any
  third-party/white-label branding, URLs or remnants across login, admin, emails
  and dashboards. `__manus__` assets exist under `client/public`. Account areas
  don't exist yet to brand.
- **Why it matters:** The platform must feel fully owned; Manus references are a
  white-label remnant.
- **Recommended fix:** Replace OAuth admin login with a first-party, fully branded
  auth system (shared with customer accounts, RBAC-separated). Audit and remove
  `__manus__`/Manus references from public assets, metadata and emails. Build
  branded login/reset/account screens in the Reni design system.
- **Files:** `server/_core/oauth.ts`, `client/public/__manus__/*`, auth UI, emails.
- **Risk if ignored:** Brand integrity; lock-in; the explicit requirement unmet.

---

## Priority 8 — Analytics & data intelligence [DONE]
- **Issue (was):** Only a GA4-stub hook and a localStorage-only cookie banner; no
  event store, no BI, no ML, no AI business assistant.
- **Implemented:**
  - Modular, configurable registry of all 17 data categories
    (`shared/analytics/registry.ts`) — single source of truth.
  - Pseudonymised event ingestion (`analyticsEvents`) with server-enforced
    consent and runtime enable/disable per module (`analyticsConfig`).
  - Aggregated BI: funnels, cart abandonment, search (incl. zero-result),
    product engagement, sessions, device/geo, waitlist demand, support themes,
    consent rates (`server/analytics/queries.ts`).
  - ML models: RFM segmentation, explainable churn scoring, Holt's-linear demand
    forecasting + reorder, item-item recommendations (`server/analytics/models/*`,
    unit-tested).
  - Admin AI assistant ("Reni Intelligence") grounded strictly in live aggregated
    data, with proactive prioritised alerts (`server/analytics/{sidekick,alerts,
    router}.ts`) and the `/admin/intelligence` dashboard.
- **Remaining (PARTIAL):** scheduled digests/emails; webhook-driven recompute
  (Priority 5); per-product recommendation rendering on the storefront.

---

## Priority 9 — Privacy & compliance [DONE]
- **Issue (was):** Generic Privacy Policy not matching real collection; consent
  not stored or enforced; no internal register; no AI/ADM disclosure.
- **Implemented:**
  - Privacy Policy generated from the registry (`client/src/pages/PrivacyPage.tsx`)
    — always matches actual collection; adds classification, AI/ADM and consent-
    management sections.
  - 4-category consent banner with an append-only server ledger
    (`consentRecords`), re-openable from the footer; server re-checks consent on
    ingestion.
  - Internal Data Collection Register (generated:
    `docs/DATA_COLLECTION_REGISTER.md`) and AI/ADM register
    (`docs/AI_AND_AUTOMATED_DECISIONS.md`).
  - Identified / pseudonymised / aggregated tiers enforced; IP hashed, geo coarse.
- **Remaining (PARTIAL):** wire the footer "Cookie Preferences" link to dispatch
  `reni:open-consent`; add data access/correction/deletion (DSAR) request flow and
  admin tooling; add a standalone Cookie Policy page if desired (currently folded
  into the Privacy Policy); honour retention windows via a purge job.

---

## Priority 10 — AI assistant & chatbot safety [PARTIAL]
- **Implemented:** Hardened consumer chatbot prompt (no business/PII/secret access,
  no fabrication, injection-resistant); separate admin assistant with data-grounded,
  anti-fabrication, propose-only, injection-resistant prompt; structural
  separation (different routers/permissions/context); `aiDecisionLog` audit; full
  adversarial **test suite + mitigations matrix** in `docs/AI_SAFETY_TEST_REPORT.md`.
- **Remaining:** execute the suite live against the model in staging and record
  actual responses; add an output redaction filter (defence-in-depth).

---

## Priority 11 — Email & notifications [TODO]
- **Issue:** Transactional email is client-side EmailJS with unset keys; no
  server-side branded emails for order confirmation, password reset, admin alerts.
- **Recommended fix:** Server-side email (SES via existing AWS creds, or a
  provider) with branded templates; trigger from the webhook and auth flows; keep
  the owner-notification path (`notifyOwner`) for admin alerts.
- **Files:** new `server/email/*`, webhook, auth, forms.
- **Risk if ignored:** Customers get no confirmations; password reset impossible.

---

## Priority 12 — SEO & discoverability [PARTIAL]
- **Issue:** `sitemap.xml`, `robots.txt` and a `WebSite` JSON-LD exist (the older
  audit note was stale). Missing: per-product `Product`/`Offer` JSON-LD, canonical
  per-page tags driven by data, and product feed for ads.
- **Recommended fix:** Emit Product JSON-LD on product pages from live data;
  ensure canonical/OG per route; generate the sitemap from DB products.
- **Files:** `client/index.html`, product pages, `useSEO`, sitemap generation.

---

## Priority 13 — Performance, polish & QA

### 13.1 Fixed-position element overlap on mobile [TODO]
- **Issue:** The cookie banner (fixed, full-width bottom) and the chat widget
  (floating bottom-right) can overlap on small screens; both compete with the
  sticky cart bar.
- **Recommended fix:** Coordinate z-index and offsets; hide/relayout the chat
  bubble while the banner is open; ensure tap targets ≥ 44px.
- **Files:** `CookieConsent.tsx`, `ChatWidget.tsx`, `StickyCartBar.tsx`.

### 13.2 Placeholder / unfinished content [TODO]
- **Issue:** Empty stockists, empty journal, placeholder referral page, static
  layering guide, hardcoded reviews.
- **Recommended fix:** Populate via admin CRUD or remove from nav until ready;
  remove dead links/buttons.

### 13.3 Loading / empty / error states [PARTIAL]
- **Status:** The new Intelligence dashboard has explicit loading/empty/honesty
  states. Audit the rest of the app for consistent states.

### 13.4 Accessibility pass [TODO]
- **Issue:** Needs a heading-hierarchy, contrast, focus-visible, alt-text and
  keyboard-nav sweep across pages.

### 13.5 Admin "Stress Test" tool in production [TODO]
- **Issue:** `/admin/stress-test` could be triggered in prod.
- **Recommended fix:** Gate behind an env flag / non-production guard.

---

## Suggested execution order (next sessions)

1. **1.1–1.3** order webhook + stock decrement + lazy Stripe (unblocks commerce).
2. **2.1 + 7** first-party branded auth (customer + admin), de-Manus.
3. **3.1** DB as product source of truth.
4. **4.1–4.3 + 11** order emails, history, shipping rules, server email.
5. **5** domain-event bus wiring (uses analytics recompute/alerts already built).
6. **6** admin content CRUD + media + AI-edit approval.
7. **9 remainder** DSAR flow, retention purge, footer consent link.
8. **10 remainder** live red-team run; **12** product schema; **13** polish/QA.
