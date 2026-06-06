/**
 * Reni Cosmetics — Analytics & Data Collection Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for every category of behavioural / customer data the
 * platform may collect. This file is intentionally dependency-free so it can be
 * imported by BOTH the browser (Privacy Policy, consent UI) and the server
 * (collection gating, internal documentation generation).
 *
 * Design goals (see docs/ANALYTICS_ARCHITECTURE.md):
 *   1. Modular & configurable — every collection concern is a self-describing
 *      module. New modules slot in here with zero backend restructuring.
 *   2. The Privacy Policy is GENERATED from this registry, so disclosed
 *      behaviour can never silently drift from actual behaviour (APP 1 & APP 5).
 *   3. Consent is modelled as a first-class field and is enforced server-side.
 *   4. Each module documents its lawful basis, purpose, data classification and
 *      retention so the internal Data Collection Register stays in sync.
 *   5. Data is classified into identified / pseudonymised / aggregated tiers and
 *      Sidekick AI access is constrained per-module (default: aggregated only).
 *
 * Compliance frame: Australian Privacy Act 1988 (Cth), the 13 Australian Privacy
 * Principles (APPs), the Spam Act 2003 (Cth), and the direction of the 2024–2026
 * Privacy Act reforms (automated decision-making transparency, a likely fair &
 * reasonable test, and statutory consent definitions).
 */

/** Version of the collection model. Bump when modules/purposes change so the
 *  consent records remain auditable against the policy in force at the time. */
export const POLICY_VERSION = "2026-06-06";

/**
 * Data classification tiers. The whole platform is built around keeping data in
 * the least-identifying tier that still serves the purpose.
 */
export type DataClassification =
  /** Linked to a known natural person (email, customer id, postal address). */
  | "identified"
  /** Linked only to a random, rotating pseudonymous id (visitor/session id).
   *  Not directly attributable to an individual without additional data. */
  | "pseudonymised"
  /** Counts, rates and rollups only. No row is attributable to an individual. */
  | "aggregated";

/**
 * Consent categories. These map 1:1 to the toggles in the cookie/consent banner
 * and to the server-side consent ledger (`consentRecords`).
 */
export type ConsentCategory =
  /** Strictly necessary for the service to function. Cannot be switched off. */
  | "essential"
  /** Behavioural analytics & product/UX improvement. */
  | "analytics"
  /** Advertising, campaign measurement, audience building. */
  | "marketing"
  /** On-site personalisation & recommendations. */
  | "personalisation";

/**
 * The legitimate business purpose a module exists to serve. Mirrors the
 * "purpose of collection" required under APP 1.4 / APP 5.
 */
export type CollectionPurpose =
  | "operational"
  | "analytical"
  | "personalisation"
  | "marketing"
  | "support"
  | "product";

/**
 * How much Sidekick AI (and any other automated agent) may read from a module.
 * Defaults to aggregated-only so the assistant reasons over business
 * intelligence, not individuals (requirement 6).
 */
export type SidekickAccess = "none" | "aggregated" | "identified";

export interface AnalyticsModule {
  /** Stable machine id. Used as the discriminator on stored events. */
  id: string;
  /** Human label shown in admin + docs. */
  label: string;
  /** One-line description of what is captured. */
  description: string;
  /** Plain-English description suitable for the public Privacy Policy. */
  publicSummary: string;
  purpose: CollectionPurpose;
  classification: DataClassification;
  consent: ConsentCategory;
  /** Lawful basis / relevant Australian Privacy Principles. */
  lawfulBasis: string;
  /** Concrete event types this module emits (for pseudonymised modules). */
  eventTypes: string[];
  /** Example data points captured. NEVER include raw sensitive information. */
  dataPoints: string[];
  /** Retention in days. null = derived/aggregated, retained indefinitely as
   *  non-identifying rollups, or governed by the source record's retention. */
  retentionDays: number | null;
  /** Default on/off. Runtime overrides live in the `analyticsConfig` table. */
  defaultEnabled: boolean;
  sidekickAccess: SidekickAccess;
  /** True if this module produces or feeds automated decision-making / AI
   *  outputs that must be disclosed under the incoming ADM reforms. */
  automatedDecisioning?: boolean;
}

/**
 * THE REGISTRY. All seventeen target intelligence categories are represented.
 * Modules marked `defaultEnabled: false` are wired end-to-end but dormant until
 * explicitly switched on in admin — they require no further backend work.
 */
export const ANALYTICS_MODULES: AnalyticsModule[] = [
  {
    id: "purchase_behaviour",
    label: "Purchase Behaviour",
    description:
      "Completed orders, order value, basket composition, discount usage and purchase cadence.",
    publicSummary:
      "Your order history and purchase details, so we can fulfil orders, provide support and understand which products serve customers best.",
    purpose: "operational",
    classification: "identified",
    consent: "essential",
    lawfulBasis:
      "APP 3 — reasonably necessary to fulfil the contract of sale; APP 6 — primary purpose. Tax records retained per AU law.",
    eventTypes: ["purchase"],
    dataPoints: ["order value", "items & quantities", "discount code", "order date"],
    retentionDays: 2555, // 7 years — Australian tax law
    defaultEnabled: true,
    sidekickAccess: "aggregated",
  },
  {
    id: "product_engagement",
    label: "Product Views & Engagement",
    description:
      "Product detail views, image/gallery interactions, ingredient expander opens, dwell time per product.",
    publicSummary:
      "Which products and product information you view, so we can improve our pages and surface relevant products.",
    purpose: "product",
    classification: "pseudonymised",
    consent: "analytics",
    lawfulBasis: "APP 3 & APP 5 — collected with notice; consented analytics.",
    eventTypes: ["view_item", "view_item_list", "ingredient_expand", "image_zoom"],
    dataPoints: ["product slug", "list context", "dwell time"],
    retentionDays: 395, // 13 months
    defaultEnabled: true,
    sidekickAccess: "aggregated",
  },
  {
    id: "session_flow",
    label: "Session Duration & Browsing Flows",
    description:
      "Page views, navigation paths, session duration, scroll depth and entry/exit pages.",
    publicSummary:
      "How you move through the site and how long you spend, so we can improve navigation and page layout.",
    purpose: "analytical",
    classification: "pseudonymised",
    consent: "analytics",
    lawfulBasis: "APP 3 & APP 5 — consented analytics.",
    eventTypes: ["page_view", "session_start", "session_end", "scroll_depth"],
    dataPoints: ["path", "referrer", "duration", "scroll %"],
    retentionDays: 395,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
  },
  {
    id: "cart_abandonment",
    label: "Cart Abandonment",
    description:
      "Add-to-cart, cart updates, checkout starts and whether checkout completed.",
    publicSummary:
      "When items are added to your cart and whether checkout was completed, so we can reduce friction and (with consent) send reminders.",
    purpose: "marketing",
    classification: "pseudonymised",
    consent: "analytics",
    lawfulBasis:
      "APP 3 — consented analytics. Identified abandonment reminders require APP 7 / Spam Act marketing consent.",
    eventTypes: ["add_to_cart", "remove_from_cart", "begin_checkout", "checkout_abandoned"],
    dataPoints: ["cart items", "cart value", "checkout step reached"],
    retentionDays: 180,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
  },
  {
    id: "search_behaviour",
    label: "Search Behaviour",
    description: "On-site search terms, result counts and zero-result searches.",
    publicSummary:
      "What you search for on our site, so we can improve search results and identify products customers want.",
    purpose: "product",
    classification: "pseudonymised",
    consent: "analytics",
    lawfulBasis: "APP 3 & APP 5 — consented analytics.",
    eventTypes: ["search", "search_no_results", "search_result_click"],
    dataPoints: ["query text", "result count", "clicked result"],
    retentionDays: 395,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
  },
  {
    id: "waitlist_engagement",
    label: "Waitlist Engagement",
    description:
      "Out-of-stock notify-me sign-ups and conversion from waitlist to purchase.",
    publicSummary:
      "When you ask to be notified about an out-of-stock product, so we can let you know and gauge demand.",
    purpose: "operational",
    classification: "identified",
    consent: "essential",
    lawfulBasis:
      "APP 3 — necessary to provide the requested notification; transactional, not marketing.",
    eventTypes: ["waitlist_join", "waitlist_convert"],
    dataPoints: ["email", "product slug", "notified status"],
    retentionDays: 730,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
  },
  {
    id: "ai_chat_interactions",
    label: "AI / Chat Interactions",
    description:
      "Conversations with the Reni assistant, escalation flags and (if voluntarily given) contact details.",
    publicSummary:
      "Your conversations with our AI assistant, so we can answer your questions, improve responses and follow up if needed. Responses are AI-generated and disclosed as such.",
    purpose: "support",
    classification: "pseudonymised",
    consent: "essential",
    lawfulBasis:
      "APP 3 — necessary to provide the support function; APP 5 — AI use disclosed in-chat.",
    eventTypes: ["chat_message", "chat_escalation"],
    dataPoints: ["message text", "persona", "escalation flag", "optional email"],
    retentionDays: 730,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
    automatedDecisioning: true,
  },
  {
    id: "product_preferences",
    label: "Product Preferences",
    description:
      "Inferred preferences from quiz answers, viewed pathways and purchased mechanisms.",
    publicSummary:
      "Preferences you tell us (e.g. via the skin quiz) or that we infer from your activity, so we can recommend suitable products.",
    purpose: "personalisation",
    classification: "pseudonymised",
    consent: "personalisation",
    lawfulBasis: "APP 3 — consented personalisation; no sensitive information collected.",
    eventTypes: ["quiz_complete", "preference_signal"],
    dataPoints: ["skin concern (non-sensitive)", "preferred pathway", "routine step"],
    retentionDays: 395,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
  },
  {
    id: "repeat_purchase",
    label: "Repeat Purchase Behaviour",
    description:
      "Inter-purchase intervals, reorder rates and product replenishment patterns.",
    publicSummary:
      "Patterns in your repeat purchases, so we can time helpful reminders and keep popular products in stock.",
    purpose: "analytical",
    classification: "identified",
    consent: "essential",
    lawfulBasis: "APP 6 — derived from order records for a directly related secondary purpose.",
    eventTypes: [],
    dataPoints: ["order sequence", "days between orders", "reorder rate"],
    retentionDays: null,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
  },
  {
    id: "customer_segmentation",
    label: "Customer Segmentation",
    description:
      "RFM (recency / frequency / monetary) scoring and behavioural segment assignment.",
    publicSummary:
      "Grouping customers into segments (e.g. new, loyal, lapsing) based on purchase patterns, so our communications and offers stay relevant.",
    purpose: "marketing",
    classification: "identified",
    consent: "essential",
    lawfulBasis:
      "APP 6 — directly related secondary purpose. Segment-based marketing requires APP 7 consent.",
    eventTypes: [],
    dataPoints: ["RFM scores", "segment label", "lifetime value"],
    retentionDays: null,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
    automatedDecisioning: true,
  },
  {
    id: "device_location",
    label: "Device / Browser / Location Analytics",
    description:
      "Device type, browser, operating system and coarse geographic region (country / state).",
    publicSummary:
      "Your device, browser and approximate location (country/state level only), so the site works across devices and we understand our audience. We do not track precise location.",
    purpose: "analytical",
    classification: "pseudonymised",
    consent: "analytics",
    lawfulBasis: "APP 3 & APP 5 — consented analytics; IP is hashed, not stored raw.",
    eventTypes: ["device_context"],
    dataPoints: ["device type", "browser", "OS", "country", "state", "hashed IP"],
    retentionDays: 395,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
  },
  {
    id: "conversion_funnels",
    label: "Conversion Funnels",
    description:
      "Step-by-step conversion from view → add-to-cart → checkout → purchase.",
    publicSummary:
      "How visitors progress from browsing to purchase, in aggregate, so we can find and fix drop-off points.",
    purpose: "analytical",
    classification: "aggregated",
    consent: "analytics",
    lawfulBasis: "APP 3 — aggregated, non-identifying analytics.",
    eventTypes: [],
    dataPoints: ["funnel step counts", "step conversion rates"],
    retentionDays: null,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
  },
  {
    id: "email_sms_engagement",
    label: "Email / SMS Engagement",
    description:
      "Subscription status, opens, clicks and unsubscribes for marketing messages.",
    publicSummary:
      "Whether you open or click our emails/SMS (if you have subscribed), so we can measure and improve our communications. You can unsubscribe at any time.",
    purpose: "marketing",
    classification: "identified",
    consent: "marketing",
    lawfulBasis:
      "Spam Act 2003 — express/inferred consent required; APP 7 direct marketing; unsubscribe honoured.",
    eventTypes: ["email_open", "email_click", "sms_click", "unsubscribe"],
    dataPoints: ["subscriber email", "campaign id", "open/click", "consent state"],
    retentionDays: 1095,
    defaultEnabled: false,
    sidekickAccess: "aggregated",
  },
  {
    id: "stock_demand_forecasting",
    label: "Stock Demand Forecasting",
    description:
      "Projected demand per product from sales history, used for reorder planning.",
    publicSummary:
      "We forecast product demand from aggregate sales to keep items in stock. This uses sales totals, not your identity.",
    purpose: "operational",
    classification: "aggregated",
    consent: "essential",
    lawfulBasis: "APP 6 — operational use of aggregated sales data.",
    eventTypes: [],
    dataPoints: ["daily/weekly units sold", "trend", "days of cover"],
    retentionDays: null,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
    automatedDecisioning: true,
  },
  {
    id: "churn_prediction",
    label: "Predictive Churn Indicators",
    description:
      "Per-customer churn risk score derived from recency, frequency and value signals.",
    publicSummary:
      "We estimate which customers may be lapsing, so we can offer timely, relevant support and offers. This is an automated estimate; you can ask us about or object to it.",
    purpose: "marketing",
    classification: "identified",
    consent: "essential",
    lawfulBasis:
      "APP 6 — directly related secondary purpose; outputs logged for ADM transparency (reform-ready).",
    eventTypes: [],
    dataPoints: ["churn score", "risk band", "contributing factors"],
    retentionDays: null,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
    automatedDecisioning: true,
  },
  {
    id: "product_recommendations",
    label: "Product Recommendation Signals",
    description:
      "Co-purchase / co-view item similarity used to power 'goes well with' suggestions.",
    publicSummary:
      "Suggestions based on what is commonly bought or viewed together, so we can recommend products that complement your routine.",
    purpose: "personalisation",
    classification: "pseudonymised",
    consent: "personalisation",
    lawfulBasis: "APP 3 — consented personalisation built on aggregated co-occurrence.",
    eventTypes: ["recommendation_view", "recommendation_click"],
    dataPoints: ["item-item similarity", "recommendation slot", "click"],
    retentionDays: 395,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
    automatedDecisioning: true,
  },
  {
    id: "support_trends",
    label: "Support Trends & Recurring Concerns",
    description:
      "Themes and recurring issues across chat logs and contact messages, in aggregate.",
    publicSummary:
      "Common themes in support enquiries, so we can fix recurring issues and improve our help content. Analysed in aggregate.",
    purpose: "support",
    classification: "aggregated",
    consent: "essential",
    lawfulBasis: "APP 6 — operational quality-improvement use of support records.",
    eventTypes: [],
    dataPoints: ["theme", "frequency", "escalation rate"],
    retentionDays: null,
    defaultEnabled: true,
    sidekickAccess: "aggregated",
  },
];

// ─── Derived lookups & helpers ──────────────────────────────────────────────

export const MODULE_BY_ID: Record<string, AnalyticsModule> = Object.fromEntries(
  ANALYTICS_MODULES.map(m => [m.id, m]),
);

/** Reverse index: event type → owning module. Used by the ingestion endpoint to
 *  resolve which consent category an incoming event requires. */
export const MODULE_BY_EVENT: Record<string, AnalyticsModule> = (() => {
  const idx: Record<string, AnalyticsModule> = {};
  for (const m of ANALYTICS_MODULES) {
    for (const e of m.eventTypes) idx[e] = m;
  }
  return idx;
})();

export const CONSENT_CATEGORIES: ConsentCategory[] = [
  "essential",
  "analytics",
  "marketing",
  "personalisation",
];

export function modulesForConsent(category: ConsentCategory): AnalyticsModule[] {
  return ANALYTICS_MODULES.filter(m => m.consent === category);
}

export function modulesByClassification(c: DataClassification): AnalyticsModule[] {
  return ANALYTICS_MODULES.filter(m => m.classification === c);
}

export function automatedDecisionModules(): AnalyticsModule[] {
  return ANALYTICS_MODULES.filter(m => m.automatedDecisioning);
}

/** Consent state as stored client-side and in the server ledger. `essential` is
 *  always true; the remaining categories are opt-in/opt-out. */
export interface ConsentState {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  personalisation: boolean;
  /** Policy version the choice was made against. */
  version: string;
  /** Epoch ms when the choice was recorded. */
  timestamp: number;
}

/** Whether an event of the given type may be collected under a consent state. */
export function isEventPermitted(
  eventType: string,
  consent: Pick<ConsentState, "analytics" | "marketing" | "personalisation">,
): boolean {
  const mod = MODULE_BY_EVENT[eventType];
  if (!mod) return false; // unknown events are rejected (allow-list)
  switch (mod.consent) {
    case "essential":
      return true;
    case "analytics":
      return !!consent.analytics;
    case "marketing":
      return !!consent.marketing;
    case "personalisation":
      return !!consent.personalisation;
    default:
      return false;
  }
}
