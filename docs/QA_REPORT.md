# Reni Cosmetics — QA Report

What was verified in this branch, and the limits of what can be checked without a
live database, LLM key, or browser in this environment.

## Automated checks (passing)

- **Typecheck:** `pnpm check` (tsc --noEmit) — clean.
- **Unit tests:** `pnpm test` — 28 passing across 4 files:
  - `server/analytics/models/models.test.ts` — RFM / churn / forecast / recos.
  - `server/auth/password.test.ts` — scrypt hashing + strength.
  - `server/auth.logout.test.ts` — session/cookie clearing (both sessions).
  - `server/ai-safety.test.ts` — role-gating, input validation, reply parser,
    prompt-guardrail regression (consumer + admin).
- **Production build:** `pnpm build` — client (Vite) + server (esbuild) succeed.

## Static QA

- **Internal link/route audit** (script): all reachable `<Link>`/`href` targets
  resolve to a defined route. One dead breadcrumb (`/components`) exists only
  inside `ComponentShowcase.tsx`, an unrouted shadcn demo page (not reachable by
  users; flagged for removal at a later cleanup).
- **EmailJS removal verified** — no `emailjs` references remain in `client/src`.
- **Visible third-party branding** — `manuscdn`/Manus text references removed or
  centralised (see `client/src/data/assets.ts`); product images are DB-backed.

## Accessibility / UX improvements applied

- Global visible keyboard focus (`:focus-visible`, sage outline).
- Skip-to-content link + focusable `#main-content` wrapper.
- `prefers-reduced-motion` support (disables scroll/entrance animations).
- Chat launcher no longer overlaps the cookie banner; admin stress-test hidden
  in production; consistent loading/empty/error states on the new surfaces
  (account, intelligence dashboard, content admin, forms).

## NOT verifiable in this environment (must be done in staging)

These need a running DB / LLM key / real browser and are called out honestly:

1. **Live click-through QA** of every page/flow in a browser (desktop/tablet/
   mobile), including a real Stripe test order end-to-end. Build + types + link
   audit pass, but no browser session was run here.
2. **Live LLM behavioural red-team** of both assistants (jailbreak attempts).
   Structural guarantees are automated; model behaviour needs a staging key
   (suite in `docs/AI_SAFETY_TEST_REPORT.md`).
3. **DB-dependent flows** (signup/login/reset, orders, analytics population,
   journal/stockist CRUD) compile and are wired, but require `pnpm db:push` +
   seeds to exercise. See `docs/DEPLOYMENT.md`.
4. **Full visual/responsive audit** across all ~40 pages — global a11y/motion
   improvements were made, but a per-page pixel/responsive review on real devices
   is still recommended.

## Recommended pre-launch checklist

Run `docs/DEPLOYMENT.md` steps, then in staging: place a test order, sign up /
reset password, toggle a data-collection module, restock a waitlisted product
(confirm email), and run the AI red-team suite.
