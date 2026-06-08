# Reni Cosmetics — Deployment & Operations Runbook

Steps to bring the platform fully live after the work on the
`claude/privacy-analytics-platform-RFGDO` branch.

## 1. Apply the database schema

New tables/columns were added (analytics, consent ledger, ML insights, AI
decision log, customer auth, password reset tokens, auth audit log, product
auth fields). Apply them:

```bash
pnpm db:push
```

## 2. Seed / sync products (DB is the source of truth)

```bash
pnpm seed:products      # upserts the catalogue; preserves admin-managed stock
```

## 3. Create the first admin (no hardcoded credentials)

```bash
pnpm admin:create you@renicosmetics.com.au 'a-strong-password' 'Your Name'
# then sign in at /admin/login  (Manus OAuth also still works)
```

## 4. Environment variables

System-injected (Manus): `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`,
`OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `BUILT_IN_FORGE_API_*`.

Set these to enable the remaining flows:

| Variable | Enables |
|---|---|
| `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY` | Checkout |
| `STRIPE_WEBHOOK_SECRET` | Order creation (point Stripe at `/api/stripe/webhook`) |
| `RESEND_API_KEY` (+ optional `EMAIL_FROM`, `APP_URL`) | Transactional email (order confirmation, shipment, refund, password reset, welcome, back-in-stock) |
| `OWNER_EMAIL` | Where the business digest email is sent (else owner notification only) |
| `VITE_GA4_MEASUREMENT_ID` | Optional GA4 mirror (first-party analytics work without it) |

Until `RESEND_API_KEY` is set, emails are logged to the console and the password
reset flow returns a dev token in non-production so it stays testable.

## 5. Stripe webhook

In the Stripe dashboard add an endpoint to `https://<domain>/api/stripe/webhook`
for `checkout.session.completed`, and set `STRIPE_WEBHOOK_SECRET`. The handler
creates the order + line items, upserts the customer, decrements stock, emails
the confirmation, notifies the owner, and recomputes analytics.

## 6. Analytics & consent

- Behavioural analytics are consent-gated; nothing optional is collected until a
  visitor consents. Toggle collection modules at `/admin/intelligence`.
- Regenerate the internal data register after registry changes:
  `pnpm gen:register`.

## 7. Verify

```bash
pnpm check     # typecheck
pnpm test      # unit tests
pnpm build     # production build (client + server)
```

Then smoke-test: sign up / sign in / reset password, place a test order
(`4242 4242 4242 4242`), confirm the order appears in `/admin` and in the
customer's account, check `/admin/intelligence` populates, and confirm the
cookie banner → consent → analytics flow.

## Operational scripts

| Command | Purpose |
|---|---|
| `pnpm admin:create <email> <pw> [name]` | Create/reset an admin |
| `pnpm seed:products` | Seed/sync the catalogue (keeps admin stock) |
| `pnpm seed:content` | Seed Journal + Stockists from existing content |
| `pnpm gen:register` | Regenerate the data-collection register |
| `pnpm purge:retention` | Delete data past its retention window (run daily via cron) |

## Scheduled jobs (cron)

- `pnpm purge:retention` — daily (data-retention compliance).
- `analytics.sendDigest` (tRPC, admin) — weekly, for the business digest email.
  Trigger via an authenticated scheduled call, or the "Email digest" button.
- `cart.sendReminders` (tRPC, admin) — hourly/daily, abandoned-cart recovery
  emails (consent-gated). Trigger via cron or the "Cart reminders" button.
