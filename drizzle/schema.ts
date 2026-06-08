import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users / Auth ─────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // First-party admin login (parallel to Manus OAuth). Null for OAuth-only users.
  passwordHash: varchar("passwordHash", { length: 256 }),
  // TOTP multi-factor auth (base32 secret). mfaEnabled gates enforcement at login.
  mfaSecret: varchar("mfaSecret", { length: 64 }),
  mfaEnabled: boolean("mfaEnabled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  tagline: varchar("tagline", { length: 256 }),
  description: text("description"),
  pathway: varchar("pathway", { length: 128 }),
  format: varchar("format", { length: 128 }),
  size: varchar("size", { length: 64 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  phase: int("phase").default(1),
  available: boolean("available").default(true).notNull(),
  image: text("image"),
  hoverImage: text("hoverImage"),
  badge: varchar("badge", { length: 64 }),
  howToUse: text("howToUse"),
  fullInci: text("fullInci"),
  heroActives: json("heroActives"),
  metaTitle: varchar("metaTitle", { length: 256 }),
  metaDescription: text("metaDescription"),
  stockQty: int("stockQty").default(0).notNull(),
  lowStockThreshold: int("lowStockThreshold").default(10).notNull(),
  sku: varchar("sku", { length: 64 }),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─── Customers ────────────────────────────────────────────────────────────────
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("firstName", { length: 128 }),
  lastName: varchar("lastName", { length: 128 }),
  phone: varchar("phone", { length: 32 }),
  address: text("address"),
  suburb: varchar("suburb", { length: 128 }),
  state: varchar("state", { length: 16 }),
  postcode: varchar("postcode", { length: 8 }),
  country: varchar("country", { length: 64 }).default("Australia"),
  notes: text("notes"),
  tags: json("tags"),
  acceptsMarketing: boolean("acceptsMarketing").default(false),
  totalOrders: int("totalOrders").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0"),
  // ── Authentication (first-party customer accounts) ──
  // Null for guest checkout records that have never set a password. Stored as a
  // self-describing scrypt hash string; never the raw password.
  passwordHash: varchar("passwordHash", { length: 256 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ─── Password Reset Tokens ────────────────────────────────────────────────────
// Only the SHA-256 hash of the token is stored, so a database leak cannot be
// used to reset accounts. Tokens are single-use and time-limited.
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// ─── Auth Audit Log ───────────────────────────────────────────────────────────
// Security audit trail for authentication-sensitive events (logins, signups,
// password resets, preference changes). IP is hashed, never stored raw.
export const authAuditLog = mysqlTable("authAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  actorType: mysqlEnum("actorType", ["customer", "admin", "anonymous"]).default("customer").notNull(),
  actorId: varchar("actorId", { length: 64 }),
  email: varchar("email", { length: 320 }),
  // login_success | login_fail | signup | logout | password_reset_request |
  // password_reset | profile_update | consent_update
  event: varchar("event", { length: 48 }).notNull(),
  success: boolean("success").default(true).notNull(),
  ipHash: varchar("ipHash", { length: 64 }),
  userAgent: varchar("userAgent", { length: 512 }),
  detail: varchar("detail", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuthAuditLog = typeof authAuditLog.$inferSelect;
export type InsertAuthAuditLog = typeof authAuditLog.$inferInsert;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  customerId: int("customerId"),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerName: varchar("customerName", { length: 256 }),
  status: mysqlEnum("status", [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", [
    "pending",
    "paid",
    "failed",
    "refunded",
  ]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 8 }).default("AUD"),
  shippingAddress: json("shippingAddress"),
  giftNote: text("giftNote"),
  trackingNumber: varchar("trackingNumber", { length: 128 }),
  trackingUrl: text("trackingUrl"),
  notes: text("notes"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId"),
  productSlug: varchar("productSlug", { length: 128 }),
  productName: varchar("productName", { length: 256 }).notNull(),
  productImage: text("productImage"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
  lineTotal: decimal("lineTotal", { precision: 10, scale: 2 }).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ─── Newsletter Subscribers ───────────────────────────────────────────────────
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 64 }).default("footer"),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;

// ─── Waitlist ─────────────────────────────────────────────────────────────────
export const waitlist = mysqlTable("waitlist", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  productSlug: varchar("productSlug", { length: 128 }).notNull(),
  productName: varchar("productName", { length: 256 }),
  notified: boolean("notified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Waitlist = typeof waitlist.$inferSelect;

// ─── Contact Messages ─────────────────────────────────────────────────────────
export const contactMessages = mysqlTable("contactMessages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 256 }),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  replied: boolean("replied").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;

// ─── Chat Logs ────────────────────────────────────────────────────────────────
export const chatLogs = mysqlTable("chatLogs", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  personaName: varchar("personaName", { length: 32 }).notNull(),
  userMessage: text("userMessage").notNull(),
  assistantReply: text("assistantReply").notNull(),
  escalated: boolean("escalated").default(false),
  isBusinessHours: boolean("isBusinessHours").default(true),
  visitorEmail: varchar("visitorEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatLog = typeof chatLogs.$inferSelect;
export type InsertChatLog = typeof chatLogs.$inferInsert;

// ─── Analytics: Pseudonymised Event Store ───────────────────────────────────
// Behavioural events keyed by a rotating, client-generated pseudonymous
// visitorId. No raw IP is stored — only a salted hash (`ipHash`) and coarse geo.
// `customerId` is populated ONLY when the event is part of an identified,
// consented flow (e.g. a logged purchase); it is otherwise null.
export const analyticsEvents = mysqlTable("analyticsEvents", {
  id: int("id").autoincrement().primaryKey(),
  // Pseudonymous identifiers
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  // Classification of THIS event row (mirrors the module's tier)
  classification: mysqlEnum("classification", [
    "identified",
    "pseudonymised",
    "aggregated",
  ]).default("pseudonymised").notNull(),
  // Module + event taxonomy (validated server-side against the registry)
  module: varchar("module", { length: 64 }).notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  // Common dimensions
  path: varchar("path", { length: 512 }),
  referrer: varchar("referrer", { length: 512 }),
  productSlug: varchar("productSlug", { length: 128 }),
  searchQuery: varchar("searchQuery", { length: 256 }),
  value: decimal("value", { precision: 10, scale: 2 }),
  quantity: int("quantity"),
  durationMs: int("durationMs"),
  // Device / coarse location (device_location module)
  deviceType: varchar("deviceType", { length: 32 }),
  browser: varchar("browser", { length: 64 }),
  os: varchar("os", { length: 64 }),
  country: varchar("country", { length: 64 }),
  region: varchar("region", { length: 64 }),
  ipHash: varchar("ipHash", { length: 64 }),
  // Consent snapshot at time of collection (accountability — APP 1)
  consentAnalytics: boolean("consentAnalytics").default(false).notNull(),
  consentMarketing: boolean("consentMarketing").default(false).notNull(),
  consentPersonalisation: boolean("consentPersonalisation").default(false).notNull(),
  // Optional identified linkage (null unless consented + operationally needed)
  customerId: int("customerId"),
  // Arbitrary, non-sensitive structured detail
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// ─── Consent Ledger ─────────────────────────────────────────────────────────
// Append-only audit trail of consent choices. Every change writes a new row so
// we can prove what was consented, against which policy version, and when.
export const consentRecords = mysqlTable("consentRecords", {
  id: int("id").autoincrement().primaryKey(),
  visitorId: varchar("visitorId", { length: 64 }).notNull(),
  customerId: int("customerId"),
  analytics: boolean("analytics").default(false).notNull(),
  marketing: boolean("marketing").default(false).notNull(),
  personalisation: boolean("personalisation").default(false).notNull(),
  // The policy/registry version the choice was made against
  policyVersion: varchar("policyVersion", { length: 32 }).notNull(),
  // How the choice was captured: banner_accept_all / banner_essential / banner_custom / preferences
  source: varchar("source", { length: 48 }).default("banner").notNull(),
  userAgent: varchar("userAgent", { length: 512 }),
  ipHash: varchar("ipHash", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConsentRecord = typeof consentRecords.$inferSelect;
export type InsertConsentRecord = typeof consentRecords.$inferInsert;

// ─── Analytics Module Configuration ─────────────────────────────────────────
// Runtime on/off overrides for registry modules so collection can be tuned
// without a redeploy. Absence of a row means "use the registry default".
export const analyticsConfig = mysqlTable("analyticsConfig", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: varchar("moduleId", { length: 64 }).notNull().unique(),
  enabled: boolean("enabled").notNull(),
  updatedBy: varchar("updatedBy", { length: 64 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnalyticsConfig = typeof analyticsConfig.$inferSelect;

// ─── Customer Insights (ML / derived) ───────────────────────────────────────
// Per-customer derived scores: RFM segmentation, churn risk, LTV and predicted
// reorder timing. This is IDENTIFIED, AUTOMATED DECISION-MAKING output — it is
// retained with an explanation so it can be disclosed/contested (reform-ready).
export const customerInsights = mysqlTable("customerInsights", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().unique(),
  email: varchar("email", { length: 320 }),
  // RFM
  recencyDays: int("recencyDays"),
  frequency: int("frequency"),
  monetary: decimal("monetary", { precision: 10, scale: 2 }),
  rScore: int("rScore"),
  fScore: int("fScore"),
  mScore: int("mScore"),
  segment: varchar("segment", { length: 48 }),
  // Predictive
  churnScore: decimal("churnScore", { precision: 5, scale: 4 }),
  churnRisk: mysqlEnum("churnRisk", ["low", "medium", "high"]),
  ltv: decimal("ltv", { precision: 10, scale: 2 }),
  predictedNextOrderDays: int("predictedNextOrderDays"),
  // Explainability for ADM transparency
  factors: json("factors"),
  modelVersion: varchar("modelVersion", { length: 32 }),
  computedAt: timestamp("computedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerInsight = typeof customerInsights.$inferSelect;
export type InsertCustomerInsight = typeof customerInsights.$inferInsert;

// ─── AI / Automated Decision Log ────────────────────────────────────────────
// Transparency ledger for AI-generated outputs and automated decisions
// (Sidekick replies, churn scoring, recommendations). Prepares the platform for
// the Privacy Act reform requirements on ADM disclosure & contestability.
export const aiDecisionLog = mysqlTable("aiDecisionLog", {
  id: int("id").autoincrement().primaryKey(),
  // What kind of decision/output: "chat_reply" | "churn_score" | "recommendation" | "segmentation" | "forecast"
  decisionType: varchar("decisionType", { length: 48 }).notNull(),
  // Subject the decision is about, if any
  subjectType: varchar("subjectType", { length: 32 }),
  subjectId: varchar("subjectId", { length: 64 }),
  modelId: varchar("modelId", { length: 64 }),
  modelVersion: varchar("modelVersion", { length: 32 }),
  // Whether the decision was disclosed to the affected person
  disclosed: boolean("disclosed").default(true).notNull(),
  // Whether a human is in the loop before the decision has an effect
  humanReviewable: boolean("humanReviewable").default(true).notNull(),
  inputsSummary: json("inputsSummary"),
  output: json("output"),
  explanation: text("explanation"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiDecisionLog = typeof aiDecisionLog.$inferSelect;
export type InsertAiDecisionLog = typeof aiDecisionLog.$inferInsert;

// ─── Journal / Blog (admin-managed content) ─────────────────────────────────
export const journalPosts = mysqlTable("journalPosts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 256 }).notNull(),
  category: varchar("category", { length: 64 }),
  excerpt: text("excerpt"),
  content: text("content"), // paragraphs separated by blank lines
  image: text("image"),
  author: varchar("author", { length: 128 }),
  readTime: varchar("readTime", { length: 32 }),
  relatedProductSlugs: json("relatedProductSlugs"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JournalPost = typeof journalPosts.$inferSelect;
export type InsertJournalPost = typeof journalPosts.$inferInsert;

// ─── Stockists (admin-managed) ──────────────────────────────────────────────
export const stockists = mysqlTable("stockists", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  type: varchar("type", { length: 128 }),
  region: varchar("region", { length: 128 }),
  location: varchar("location", { length: 256 }),
  url: text("url"),
  online: boolean("online").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Stockist = typeof stockists.$inferSelect;
export type InsertStockist = typeof stockists.$inferInsert;

// ─── Product Reviews (moderated) ────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productSlug: varchar("productSlug", { length: 128 }).notNull(),
  customerName: varchar("customerName", { length: 128 }).notNull(),
  location: varchar("location", { length: 128 }),
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 200 }),
  body: text("body").notNull(),
  verified: boolean("verified").default(false).notNull(), // verified buyer
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── Media Library (admin uploads) ──────────────────────────────────────────
export const mediaAssets = mysqlTable("mediaAssets", {
  id: int("id").autoincrement().primaryKey(),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 256 }),
  contentType: varchar("contentType", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaAsset = typeof mediaAssets.$inferSelect;

// ─── Abandoned Carts (consent-gated recovery) ───────────────────────────────
// Captured when a shopper reaches checkout. A recovery email is only sent when
// the shopper opted into marketing (Spam Act consent) and the cart wasn't
// completed. Marked recovered when a matching paid order arrives.
export const abandonedCarts = mysqlTable("abandonedCarts", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  customerName: varchar("customerName", { length: 256 }),
  items: json("items"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  acceptsMarketing: boolean("acceptsMarketing").default(false).notNull(),
  visitorId: varchar("visitorId", { length: 64 }),
  recovered: boolean("recovered").default(false).notNull(),
  remindersSent: int("remindersSent").default(0).notNull(),
  lastReminderAt: timestamp("lastReminderAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AbandonedCart = typeof abandonedCarts.$inferSelect;

// ─── AI Edit Proposals (approval queue) ─────────────────────────────────────
// The admin AI proposes structured changes here; an admin reviews and applies
// them. Nothing is changed until explicitly approved (human-in-the-loop).
export const aiProposals = mysqlTable("aiProposals", {
  id: int("id").autoincrement().primaryKey(),
  // "product_update" | "journal_upsert"
  type: varchar("type", { length: 32 }).notNull(),
  summary: varchar("summary", { length: 512 }).notNull(),
  payload: json("payload").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "applied", "failed"]).default("pending").notNull(),
  createdBy: varchar("createdBy", { length: 64 }),
  instruction: text("instruction"),
  resultNote: varchar("resultNote", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  decidedAt: timestamp("decidedAt"),
});

export type AiProposal = typeof aiProposals.$inferSelect;
