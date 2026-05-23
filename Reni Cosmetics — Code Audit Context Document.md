# Reni Cosmetics — Code Audit Context Document

**Prepared by:** Manus AI  
**Date:** May 2026  
**For:** Code auditor reviewing the Reni Cosmetics web application  
**Live domain:** [renicosmetics.com](https://renicosmetics.com) / [www.renicosmetics.com](https://www.renicosmetics.com)  
**ABN:** 92 692 713 821

---

## 1. What This Project Is

Reni Cosmetics is a **direct-to-consumer clinical anti-ageing skincare brand** based in Melbourne, Australia. This repository is the complete source code for the brand's e-commerce website, built as a full-stack React + Node.js application.

The website serves as the primary sales channel for a range of clinical-grade peptide serums. It is not a Shopify or WooCommerce store — it is a fully custom-built application with its own database, authentication, admin panel, AI chat widget, and Stripe payment processing. Every component, route, and database table was purpose-built for this brand.

The brand sits under **Reni Brands**, a holding company that owns multiple independent cosmetic and wellness brands. Reni Cosmetics is the flagship clinical skincare brand in that portfolio.

---

## 2. Brand Values and Philosophy

Understanding the brand values is essential for auditing the codebase, because many design and copy decisions were made deliberately to reflect these values rather than follow conventional e-commerce patterns.

**Core philosophy:** *Mechanism over marketing. Always.*

Every product in the Reni Cosmetics range targets a single, verified biological mechanism. The brand explicitly rejects the industry norm of stacking 12+ actives in a single formula. This "single-pathway architecture" is the central differentiator and is reflected throughout the codebase — in product names, in the Science page, in the AI chat persona's knowledge base, and in the ingredient disclosure approach.

**Transparency as a brand pillar:** Every active ingredient is disclosed by name and concentration. No proprietary blends. No undisclosed percentages. This is unusual in the cosmetics industry and is treated as a competitive advantage, not just a compliance requirement.

**Clinical credibility without clinical pretension:** The brand targets educated, sceptical consumers who have been burned by marketing claims before. The copy is precise, the science is cited, and fabricated press quotes or fake review aggregates have been deliberately removed from the site. The ReviewsSection component contains a code comment explaining this decision explicitly.

**Australian compliance:** All product claims are cosmetic-only (no TGA therapeutic claims). The AI chat widget includes an ACL-compliant disclosure. The ABN (92 692 713 821) is registered and valid.

---

## 3. The Product Range

At the time of this build, the site carries six Phase 1 products. All prices are in AUD.

| Product | Mechanism | Key Actives | Price | Size |
|---------|-----------|-------------|-------|------|
| NEUROVÉCTRIX™ Core | Neuromodulation | SNAP-8™ (10ppm), Argireline® Amplified (10%) | $128 | 30ml |
| RECEPTORLIFT™ | Receptor-level firming | Progeline™ (2%), Syn-Coll™ (2%) | $158 | 30ml |
| STRESSDEFENSE™ | Cellular longevity / cortisol pathway | Griffonia Lysate Advanced, Ectoin | $148 | 30ml |
| DERMASHIELD™ | Barrier renewal | HyaMatrix™ VII+, Ceramide NP | $138 | 30ml |
| NEUROVÉCTRIX™ Eye-Lift | Neuromodulation (periorbital) | SNAP-8™, Eyeliss™ | $168 | 15ml |
| LIPOVECTRIX™ | Lip volumising | DermaPeptide Warming PF, Argireline® Amplified | $178 | 15ml |

A bundle page exists at `/bundle` offering all four core Phase 1 products as a complete AM/PM system. Phase 2 products are in development.

---

## 4. Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **shadcn/ui** component library (Radix UI primitives)
- **Framer Motion** for scroll-triggered animations
- **tRPC 11** for type-safe API calls (no REST endpoints, no Axios)
- **TanStack Query 5** for server state management
- **React Hook Form + Zod** for form validation
- **Embla Carousel** for product image carousels
- **Recharts** for admin analytics charts
- **Streamdown** for markdown rendering in the AI chat widget
- **@emailjs/browser** for client-side email sending (contact form, newsletter, notify-me)
- **@stripe/stripe-js** for Stripe.js on the frontend

### Backend
- **Express 4** (Node.js)
- **tRPC 11** server-side router
- **Drizzle ORM** with MySQL/TiDB database
- **Stripe SDK v22** for payment processing
- **jose** for JWT session management
- **Manus OAuth** for user authentication (owner/admin login)
- **AWS S3** for file/image storage
- **Helmet** for HTTP security headers
- **express-rate-limit** for API rate limiting

### Database (MySQL / TiDB)
Tables: `users`, `products`, `customers`, `orders`, `orderItems`, `subscribers`, `waitlist`, `contactMessages`, `chatLogs`

### Build & Tooling
- **Vite 7** for frontend bundling
- **esbuild** for server bundling
- **pnpm** as package manager
- **Vitest** for unit testing
- **TypeScript 5.9** across the full stack
- **Drizzle Kit** for database migrations (`pnpm db:push`)

---

## 5. Application Architecture

### Routing
All frontend routes are defined in `client/src/App.tsx`. The application uses Wouter for client-side routing. There are two route groups:

**Public-facing routes:**
`/`, `/shop`, `/products/:slug`, `/system`, `/science`, `/journal`, `/journal/:slug`, `/cart`, `/bundle`, `/quiz`, `/about`, `/help`, `/shipping`, `/faq`, `/contact`, `/stockists`, `/privacy`, `/terms`, `/terms-of-use`, `/checkout`, `/order-confirmation`, `/layering-guide`, `/referral`

**Admin routes (role-gated):**
`/admin`, `/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/analytics`, `/admin/messages`, `/admin/subscribers`, `/admin/chat-logs`, `/admin/stress-test`

### API Layer
All backend procedures are defined in `server/routers.ts` using tRPC. The router is split into logical sub-routers. The server entry point is `server/_core/index.ts`.

Key procedure groups:
- `auth.*` — Manus OAuth login/logout, session management
- `system.*` — Owner notifications
- `products.*` — Product CRUD, stock management
- `orders.*` — Order creation, status updates, Stripe webhook handling
- `customers.*` — Customer management
- `subscribers.*` — Newsletter subscription
- `waitlist.*` — Notify-me / out-of-stock waitlist
- `contact.*` — Contact form submissions
- `chat.*` — AI chat widget (LLM invocation, chat log storage)
- `checkout.*` — Stripe checkout session creation
- `admin.*` — Admin-only analytics, dashboard data

### Authentication
The site uses **Manus OAuth** for the admin/owner login. Regular shoppers do not need to create an account to purchase — the checkout is guest-based. The `protectedProcedure` and `adminProcedure` wrappers in `server/_core/trpc.ts` gate admin-only operations.

### Payments
Stripe is integrated for all purchases. The flow is:
1. Customer fills in shipping details on `/checkout`
2. Frontend calls `trpc.checkout.createSession` with cart items and shipping address
3. Server creates a Stripe Checkout Session and returns the hosted URL
4. Frontend opens the Stripe-hosted checkout in a new tab (`window.open`)
5. On completion, Stripe fires a webhook to `/api/stripe/webhook`
6. The webhook handler verifies the signature, creates an order record in the database, and marks payment as paid

Stripe sandbox credentials are pre-configured. The user must claim the sandbox at the URL provided in the Stripe setup card. Test card: `4242 4242 4242 4242`.

### AI Chat Widget
The `ChatWidget.tsx` component renders a floating chat button on all public pages. It rotates between four AI personas (Mila, Jade, Cass, Lena) on a daily basis using a date-based hash. The system prompt and knowledge base are defined in `server/chat-persona-design.md` and injected into the LLM call in `server/routers.ts`. Chat logs are stored in the `chatLogs` database table and are visible in the admin panel at `/admin/chat-logs`.

### Admin Panel
The admin panel at `/admin` is role-gated (requires `role: "admin"` in the `users` table). It includes:
- **Overview dashboard** — key metrics, recent orders, low stock alerts
- **Products** — CRUD for product catalogue
- **Orders** — order management, status updates, tracking numbers
- **Customers** — customer database
- **Analytics** — traffic and revenue charts
- **Messages** — contact form inbox
- **Subscribers** — newsletter list
- **Chat Logs** — AI chat conversation history
- **Stress Test** — internal tool for testing site performance

---

## 6. Design System

### Visual Identity
The site uses a **"Dark Science Editorial"** aesthetic — the design was deliberately chosen to evoke a luxury pharmaceutical journal rather than a conventional beauty brand. The alternating dark/light section structure mirrors the brand's AM/PM protocol architecture.

**Colour palette:**
- Obsidian (dark): `#2D2C2C` — primary dark background
- Alabaster (light): `#FAFAF7` — primary light background
- Parchment: `#EAEADF` — primary text on dark backgrounds
- Sage accent: `#6B7A3E` — used sparingly for badges and highlights

**Typography:**
- Display / headlines: **Playfair Display** (serif) — product names, hero headlines, pull-quotes
- Body / UI: **DM Sans** — all body copy, navigation, labels
- Monospace / data: **Space Mono** — ingredient percentages, pH values, technical specs

**Animation philosophy:** Staggered fade-in on scroll. `translateY(30px) → translateY(0)`, opacity `0 → 1`, 700ms ease-out, 100ms stagger between siblings. No gratuitous motion. The site should feel like turning pages in a scientific journal — deliberate, not playful.

### Component Library
shadcn/ui components are used for interactive UI elements (dialogs, selects, toasts, etc.). Custom brand components are in `client/src/components/`. The design system is defined in `client/src/index.css` using CSS custom properties.

---

## 7. Key Files for Auditors

| File | Purpose |
|------|---------|
| `drizzle/schema.ts` | Complete database schema — all tables and types |
| `server/routers.ts` | All tRPC procedures — the entire API surface |
| `server/db.ts` | Database query helpers used by procedures |
| `server/_core/index.ts` | Express server entry point, middleware setup, webhook route |
| `server/_core/env.ts` | All environment variable definitions |
| `server/_core/trpc.ts` | tRPC context, `publicProcedure`, `protectedProcedure`, `adminProcedure` |
| `client/src/App.tsx` | All routes and layout wrappers |
| `client/src/index.css` | Global design tokens, CSS variables, typography |
| `client/src/data/products.ts` | Static product data (used for frontend rendering before DB sync) |
| `client/src/components/ChatWidget.tsx` | AI chat widget implementation |
| `client/src/components/Navbar.tsx` | Global navigation |
| `client/src/pages/CheckoutPage.tsx` | Checkout flow with Stripe session creation |
| `client/src/pages/admin/` | All admin panel pages |
| `server/chat-persona-design.md` | AI chat persona definitions and system prompt design |
| `ideas.md` | Design decision log — documents why key choices were made |
| `vitest.config.ts` | Test configuration |
| `server/auth.logout.test.ts` | Reference test file |

---

## 8. Known Issues and Incomplete Features

The following items were identified during development as requiring further work. They are documented here for the auditor's awareness.

### High Priority
- **EmailJS credentials not yet configured.** The contact form, newsletter signup, and Notify Me modal all use `@emailjs/browser` on the frontend. The environment variables `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_PUBLIC_KEY`, `VITE_EMAILJS_CONTACT_TEMPLATE_ID`, `VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID`, and `VITE_EMAILJS_NOTIFYME_TEMPLATE_ID` have not yet been provided by the owner. Until these are set, form submissions will fail silently or show an error. The forms currently fall back to storing submissions in the database via tRPC, so data is not lost — but the email notification to the owner will not fire.
- **Stripe sandbox not claimed.** The Stripe test sandbox has been provisioned but the owner must claim it at the URL provided in the setup card before the payment flow can be tested end-to-end.
- **Product images are placeholder/CDN URLs.** Real product photography has not yet been uploaded. The `image` and `hoverImage` fields in the products table and in `client/src/data/products.ts` point to placeholder images. These need to be replaced with real CDN URLs via `manus-upload-file --webdev`.

### Medium Priority
- **Review system is manual.** The ReviewsSection currently displays three hardcoded early-access reviews. There is no third-party review platform integration (Okendo, Judge.me, Yotpo). A real review collection system should be implemented before scaling ad spend.
- **No results timeline on product pages.** Clinical results timelines (e.g., "visible results in 4–8 weeks") are in the AI chat knowledge base but are not displayed on the product page itself.
- **No guarantee block on homepage or product pages.** The 30-day return policy exists in the checkout page security badges but is not prominently surfaced earlier in the purchase journey.
- **Free shipping threshold not visible.** Free shipping applies over $80 AUD (per chat knowledge base) but this is not displayed in the announcement bar or on product pages.
- **Referral programme is a placeholder.** The `/referral` page exists but the referral logic (unique codes, tracking, reward fulfilment) has not been implemented.
- **Layering guide is static.** The `/layering-guide` page exists but contains static content. It could be made interactive (personalised recommendations based on skin type).

### Low Priority
- **Stockists page is empty.** The `/stockists` page exists but no stockist data has been entered.
- **Journal/blog has no real content.** The `/journal` page and `/journal/:slug` routes exist but no articles have been written. This is a significant SEO gap.
- **Admin stress test tool.** The `/admin/stress-test` page is an internal tool for load testing. It should be reviewed to ensure it cannot be triggered accidentally in production.
- **No sitemap.xml or robots.txt.** These are missing and should be added before the site is indexed by search engines.
- **No structured data (JSON-LD).** Product schema markup for Google Shopping and rich results has not been implemented.

---

## 9. Psychology-Driven Improvement Opportunities

A separate analysis was conducted mapping the site against the Suby/HexClad premium pricing psychology framework. The full report is in `PSYCHOLOGY_IMPROVEMENTS.md`. The top five improvements by expected conversion impact are:

**1. Add a 30-day guarantee block** to the homepage and product pages — prominently, not in the footer. This is the single highest-impact change for reducing purchase hesitation on a $128–$178 product.

**2. Add results timelines to product pages.** The data exists in the chat knowledge base (4–8 weeks for NEUROVÉCTRIX, 8–12 weeks for RECEPTORLIFT). It needs to be on the product page, above the fold.

**3. Translate supplier authority into consumer language.** The PressStrip lists supplier names (Sederma, Lucas Meyer, Lubrizol) in small grey text. These names mean nothing to a consumer. Each should be accompanied by a single sentence explaining why that supplier is credible.

**4. Add a mechanism badge to product cards.** Each product card in the ShopGrid should display a small tag showing the mechanism name (e.g., "Neuromodulation Pathway") to create a visual thread between the shop and the science.

**5. Name the customer identity.** The brand has a natural community of "people who read the label" — educated, sceptical buyers who demand clinical data. This identity is not currently named or activated anywhere on the site. A consistent phrase used across the homepage, About page, and email welcome sequence would strengthen brand loyalty significantly.

---

## 10. Environment Variables Required

The following environment variables must be configured for full functionality. System-injected variables (Stripe, JWT, OAuth, database) are pre-configured by the Manus platform and do not need to be set manually.

| Variable | Status | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | Auto-injected | MySQL connection string |
| `JWT_SECRET` | Auto-injected | Session cookie signing |
| `VITE_APP_ID` | Auto-injected | Manus OAuth app ID |
| `OAUTH_SERVER_URL` | Auto-injected | Manus OAuth backend |
| `VITE_OAUTH_PORTAL_URL` | Auto-injected | Manus login portal |
| `STRIPE_SECRET_KEY` | Auto-injected | Stripe server-side key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Auto-injected | Stripe frontend key |
| `STRIPE_WEBHOOK_SECRET` | Auto-injected | Stripe webhook signature |
| `BUILT_IN_FORGE_API_KEY` | Auto-injected | LLM / AI services |
| `VITE_EMAILJS_SERVICE_ID` | **Not yet set** | EmailJS service |
| `VITE_EMAILJS_PUBLIC_KEY` | **Not yet set** | EmailJS public key |
| `VITE_EMAILJS_CONTACT_TEMPLATE_ID` | **Not yet set** | Contact form email template |
| `VITE_EMAILJS_NEWSLETTER_TEMPLATE_ID` | **Not yet set** | Newsletter email template |
| `VITE_EMAILJS_NOTIFYME_TEMPLATE_ID` | **Not yet set** | Notify Me email template |

---

## 11. Running the Project Locally

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server (frontend + backend)
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

The development server runs on a dynamically assigned port. The frontend and backend are served from the same Express process in development (Vite is proxied through Express via `server/_core/vite.ts`).

---

## 12. Deployment

The site is deployed on the Manus platform. Deployment is triggered via the Publish button in the Manus Management UI — not via CLI or CI/CD. A checkpoint must be saved before publishing. The live domains are `renicosmetics.com` and `www.renicosmetics.com`.

Do not attempt to deploy via Railway, Render, Vercel, or Netlify — the project uses Manus-specific infrastructure (built-in S3, LLM API, OAuth, database) that is not portable to other platforms without significant rework.

---

*This document was generated to accompany the code audit package for Reni Cosmetics. All information is factual and verifiable against the codebase. No claims have been fabricated or estimated.*
