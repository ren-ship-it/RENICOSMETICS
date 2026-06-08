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

## Status summary (live)

**Done:** P1 (orders/stock/Stripe), P2.1 (customer auth) + 2.3 (brute-force),
P3 (DB product source of truth), P4.2/4.3 (forms→server, shipping rules),
P5 (event cascade incl. waitlist restock), P7 partial (brand-owned admin login),
P8 (analytics/BI/AI assistant), P9 (privacy/consent + DSAR), P10 (AI guardrails +
test suite), P11 (server email), P13.1/13.5 (overlap, stress-test gating).

**Remaining (needs creds / content / human decisions — see end of doc):**
P2.2 (CSP needs deployment domains), P6 (admin content CRUD / media / draft-live /
AI-edit approval), P10 live red-team (needs staging LLM), P12 dynamic sitemap,
de-Manus asset cleanup (`__manus__`, manuscdn logo — needs replacement assets),
P13.2 page *content* (journal/stockists). Operational steps: `docs/DEPLOYMENT.md`.

---

## Priority 1 — Critical blockers

### 1.1 Orders are never created after payment [DONE]
- **Issue (was):** There was no Stripe webhook handler. Payments could succeed
  with no order, customer, stock decrement, or notification recorded.
- **Implemented:** `server/stripeWebhook.ts` adds a raw-body
  `/api/stripe/webhook` route (registered in `server/_core/index.ts` before the
  JSON parser and excluded from the rate limiter). It verifies the signature with
  `STRIPE_WEBHOOK_SECRET`, and on `checkout.session.completed` creates the order +
  line items (`db.createOrder`), upserts the customer with lifetime totals
  (`db.applyOrderToCustomer`), decrements stock, notifies the owner, and triggers
  the analytics recompute. Idempotent via `db.getOrderByNumber`. Checkout now
  stashes compact line items in session metadata so the order can be rebuilt.
- **Files:** `server/stripeWebhook.ts`, `server/_core/index.ts`, `server/routers.ts`, `server/db.ts`.
- **Remaining:** order-confirmation email (Priority 11); waitlist auto-notify when
  restocked.

### 1.2 Stripe client crashes at module load without a key [DONE]
- **Issue (was):** `new Stripe(...)` ran at import time and threw without a key,
  crashing boot and the test suite (`auth.logout.test.ts`).
- **Implemented:** `server/_core/stripe.ts` constructs Stripe lazily via
  `getStripe()` (+ `isStripeConfigured()`); `routers.ts` and the webhook use it.
  The full test suite is green again.
- **Files:** `server/_core/stripe.ts`, `server/routers.ts`, `server/stripeWebhook.ts`.

### 1.3 Stock is not decremented on sale [DONE]
- **Implemented:** `db.decrementStockBySlug` (floored at zero) is called per line
  item in the webhook handler, so inventory, low-stock alerts and demand
  forecasts now reflect real sales.
- **Files:** `server/db.ts`, `server/stripeWebhook.ts`.
- **Remaining:** auto-flip `available`/notify waitlist at zero stock.

---

## Priority 2 — Security & access control

### 2.1 No customer authentication system [DONE]
- **Issue (was):** Auth was Manus OAuth for admins only; no customer accounts.
- **Implemented:** First-party customer auth, fully separate from admin:
  - scrypt password hashing with per-password salt + constant-time verify
    (`server/auth/password.ts`, unit-tested); no external dependency.
  - JWT session via `jose` in a dedicated httpOnly cookie
    (`server/auth/session.ts`); verified into the tRPC context with a new
    `customerProcedure` (`server/_core/context.ts`, `trpc.ts`).
  - `customerAuth` router: signup (claims existing guest records), login
    (non-enumerating), logout, me, password reset (single-use, hashed,
    time-limited tokens), profile update, marketing-consent update, order
    history, security log (`server/auth/router.ts`, `store.ts`).
  - Audit logging of all sensitive events with hashed IP (`authAuditLog`).
  - Strict rate limiter on `/api/trpc/customerAuth` (brute-force defence).
  - Branded UI: `/account` (sign in / create account / forgot password →
    dashboard with profile, order history, comms preferences, sign out) and
    `/reset-password`; account icon in the navbar.
- **Files:** `server/auth/*`, `drizzle/schema.ts` (customers auth fields,
  `passwordResetTokens`, `authAuditLog`), `client/src/pages/AccountPage.tsx`,
  `ResetPasswordPage.tsx`, `hooks/useCustomerAuth.ts`, `App.tsx`, `Navbar.tsx`.
- **Remaining:** password-reset + welcome emails (Priority 11); optional email
  verification; MFA (schema is ready to extend).

### 2.2 CSP disabled; CSRF posture [PARTIAL — needs deployment domains]
- **CSRF:** Lower risk than it first appears. All mutations go through tRPC as
  `POST` with `Content-Type: application/json`, which browsers cannot send
  cross-origin without a CORS preflight, and no permissive CORS is configured —
  so a third-party site cannot forge authenticated mutations. Acceptable for now.
- **Remaining (needs human input):** enabling a tuned Content-Security-Policy
  requires the exact allowed origins for this deployment (Stripe, Google Fonts,
  GA, the Manus OAuth/forge hosts, the CDN). Guessing risks breaking the site, so
  this is left for a config pass with the real domain list. Also review whether
  the session cookie `sameSite: "none"` can be tightened (it is currently `none`
  to support the Manus-hosted iframe context).
- **Files:** `server/_core/index.ts`, `server/_core/cookies.ts`.

### 2.3 Brute-force protection [DONE for customer auth]
- **Implemented:** A strict limiter (30 / 15 min) now guards
  `/api/trpc/customerAuth`, plus generic non-enumerating login responses and
  audit logging of failures.
- **Files:** `server/_core/index.ts`, `server/auth/router.ts`.
- **Remaining:** consider per-account lockout/backoff; admin login is OAuth (2.x/7).

### 2.4 Admin AI / analytics endpoints — access [DONE]
- **Status:** `analytics.*` admin endpoints use `adminProcedure` (403 for
  non-admins); ingestion/consent endpoints are public by design and consent-gated;
  identified reads (`insights.atRiskCustomers`) are admin-only and excluded from
  the AI context. See `docs/AI_SAFETY_TEST_REPORT.md`.

---

## Priority 3 — Database & source-of-truth

### 3.1 Hardcoded product data competes with the DB [DONE for commerce surfaces]
- **Issue (was):** Static `products.ts` and the DB `products` table were two
  sources of truth; admin edits didn't reach the storefront.
- **Implemented:** The DB is now authoritative for mutable fields.
  - `products.listPublic` (public) + `db.getPublicProducts()`.
  - `useStorefrontProducts()` merges live DB rows over the static catalogue:
    DB wins for price, availability, stock, images and copy; static provides
    presentational defaults; if the DB is empty/unreachable the storefront falls
    back to static (never breaks). Sold-out (stock 0) renders unavailable so the
    notify/waitlist flow shows. Admin-created products also appear.
  - Commerce-critical surfaces converted: home `ShopGrid`, `/shop` `ShopPage`,
    and `ProductPage` (which also now tracks `view_item`/`add_to_cart`).
  - `pnpm seed:products` seeds the DB from the static catalogue (preserves
    admin-managed stock on re-run).
- **Files:** `server/routers.ts`, `server/db.ts`,
  `client/src/hooks/useStorefrontProducts.ts`, `ShopGrid.tsx`, `ShopPage.tsx`,
  `ProductPage.tsx`, `scripts/seedProducts.ts`.
- **Remaining:** migrate secondary/presentational surfaces still importing the
  static list (BundlePage, SystemPage, QuizPage, CartPage display, ProtocolTeaser,
  JournalArticlePage) to the hook for full consistency.

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

### 4.2 Forms fall back silently when EmailJS is unset [DONE]
- **Implemented:** Removed client-side EmailJS entirely (no more exposed template
  ids / third-party remnant). Contact → `messages.save`, newsletter →
  `subscribers.add`, notify-me → `waitlist.add`; all persist server-side and now
  trigger an owner notification (`notifyOwner`). Contact form shows real
  loading/success/error states.
- **Files:** `ContactPage.tsx`, `Footer.tsx`, `NotifyMeModal.tsx`,
  `ShopPage.tsx`, `ProductPage.tsx`, `server/routers.ts`.
- **Note:** the `@emailjs/browser` dependency is now unused and can be dropped
  from package.json at the next dependency cleanup.

### 4.3 Free-shipping/threshold messaging inconsistent [DONE]
- **Issue (was):** Conflicting rules — free over $80 (chat/banner) vs $150
  (cart/checkout/session), plus a $150 **minimum** in the cart that BLOCKED
  checkout of any single product (cheapest is $128). A real conversion bug.
- **Implemented:** `shared/shipping.ts` is the single source of truth
  (`FREE_SHIPPING_THRESHOLD=80`, `STANDARD_SHIPPING_COST=9.95`,
  `MINIMUM_ORDER_VALUE=0`, `computeShipping()`). Wired into checkout session
  (`server/routers.ts`), `CheckoutPage`, `CartPage` (minimum removed → checkout
  no longer blocked; shows the real $9.95 cost), the `AnnouncementBar`, and the
  chat knowledge base. Change a number once, it updates everywhere.
- **Files:** `shared/shipping.ts`, `server/routers.ts`, `CheckoutPage.tsx`,
  `CartPage.tsx`, `AnnouncementBar.tsx`.
- **Note:** thresholds are a business choice — adjust them in one file.

---

## Priority 5 — Cascading & reactive behaviour [PARTIAL→mostly DONE]
- **Implemented:** A typed in-process domain-event bus (`server/events/bus.ts`)
  with handlers registered at startup (`server/events/index.ts`). The Stripe
  webhook now emits `order.paid`, and isolated handlers cascade to: owner
  notification, customer confirmation email, and a `customerInsights` recompute
  (segmentation/churn). New downstream effects are added in one place without
  touching the emitter. Storefront already reflects admin product edits live
  (P3), and the admin UI auto-refreshes via TanStack Query invalidation.
- **Files:** `server/events/*`, `server/stripeWebhook.ts`, `server/_core/index.ts`.
- **Also implemented:** `stock.changed` is emitted from admin stock changes
  (`adjustStock`, `update`) and a handler emails everyone on a product's waitlist
  when it is restocked, then marks them notified (closing a real gap — waitlist
  signups previously got nothing). `server/events/index.ts`, `routers.ts`, `db.ts`.
- **Remaining:** `product.updated` (→ cache/SEO refresh) when a CDN/cache layer
  is added.

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

## Priority 7 — Branding & authentication (de-white-label) [PARTIAL]
- **Issue:** Admin auth was Manus OAuth only (third-party). The brief wants
  brand-owned auth with no third-party remnants. `__manus__` assets exist under
  `client/public`.
- **Implemented (per your decision — parallel, low-risk):** A brand-owned
  first-party admin login now runs ALONGSIDE Manus OAuth:
  - `adminAuth` router (email + password) → short-lived (12h) admin session
    cookie, resolved into `ctx.user` so all `adminProcedure` checks are unchanged
    (`server/auth/adminRouter.ts`, `adminSession.ts`, `server/_core/context.ts`).
  - Branded `/admin/login` page; `AdminGuard` now redirects there (not to `/`);
    OAuth remains available via a secondary link.
  - No hardcoded credentials: bootstrap via `pnpm admin:create <email> <pw>`
    (`scripts/createAdmin.ts`); `users.passwordHash` added; logout clears both
    sessions; rate-limited; audit-logged.
- **Remaining:** customer-facing auth/account screens are already branded (P2);
  audit/remove `__manus__` references from public assets, page metadata and
  (pending) emails; optionally retire OAuth once the first-party admin is verified
  in production.
- **Files:** `server/auth/adminRouter.ts`, `adminSession.ts`, `server/_core/context.ts`,
  `routers.ts`, `scripts/createAdmin.ts`, `client/src/pages/admin/AdminLogin.tsx`, `App.tsx`.

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

### 9.x Data subject rights (DSAR) [DONE]
- **Implemented:** Signed-in customers can download all personal data linked to
  their account (`customerAuth.exportMyData` → JSON) and request account deletion
  (`customerAuth.requestAccountDeletion` → audit + owner notification, actioned
  within 30 days; order records retained per tax law). Surfaced in the account
  "Your Data & Privacy" panel.
- **Files:** `server/auth/router.ts`, `client/src/pages/AccountPage.tsx`.

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

## Priority 11 — Email & notifications [DONE (pending provider key)]
- **Implemented:** A dependency-free server-side email layer (`server/email/*`)
  with branded HTML templates (welcome, password reset, order confirmation) in
  the Reni palette and no third-party branding. Transport uses the Resend HTTP
  API when `RESEND_API_KEY` is set, and logs to the console otherwise so flows
  are testable now. Wired to: customer signup (welcome), password reset (real
  email; dev token only exposed when email is unconfigured in non-prod), and the
  `order.paid` event (confirmation). Owner alerts still use `notifyOwner`.
- **Go live:** set `RESEND_API_KEY` (and optionally `EMAIL_FROM`, `APP_URL`).
  Swapping to SES only changes `server/email/index.ts:deliver()`.
- **Files:** `server/email/index.ts`, `server/email/templates.ts`,
  `server/auth/router.ts`, `server/events/index.ts`.
- **Remaining:** migrate the client-side EmailJS contact/newsletter forms to the
  server email layer (removes exposed template ids); shipment-tracking email.

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

### 13.1 Fixed-position element overlap on mobile [DONE]
- **Implemented:** The chat launcher is hidden until the cookie/consent banner is
  resolved (it listens for the `reni:consent` event), so the two bottom-corner
  fixed elements never overlap. Consent-first is also better UX.
- **Files:** `ChatWidget.tsx` (consent-gated launcher).

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

### 13.5 Admin "Stress Test" tool in production [DONE]
- **Implemented:** The Stress Test nav item is hidden in production builds
  (`import.meta.env.PROD`); the route stays admin-gated. `AdminLayout.tsx`.

### 13.2 Placeholder content [NOTE — owner content task]
- Stockists/journal/referral pages exist with real layouts; the gap is *content*
  (no articles/stockists written), not code. These need owner-provided content or
  admin CRUD (see Priority 6). Not fabricating placeholder copy.

## Priority 12 — SEO [PARTIAL→mostly DONE]
- **In place:** `robots.txt`, `sitemap.xml`, OG/Twitter tags, `WebSite` JSON-LD
  (index.html), and per-product `Product` JSON-LD generated on `ProductPage` via
  `useSEO` from live data.
- **Remaining:** generate the sitemap from DB products; ensure canonical tags per
  route are data-driven; add Organization JSON-LD sitewide.

---

## Suggested execution order (next sessions)

1. ~~**1.1–1.3** order webhook + stock decrement + lazy Stripe~~ **[DONE]** — commerce unblocked.
2. ~~**2.1** first-party branded customer auth~~ **[DONE]**. Admin de-Manus (7) still pending — flagged: removing Manus OAuth may break the hosted admin login, so confirm approach first.
3. **3.1** DB as product source of truth.
4. **4.1–4.3 + 11** order emails, history, shipping rules, server email.
5. **5** domain-event bus wiring (uses analytics recompute/alerts already built).
6. **6** admin content CRUD + media + AI-edit approval.
7. **9 remainder** DSAR flow, retention purge, footer consent link.
8. **10 remainder** live red-team run; **12** product schema; **13** polish/QA.
