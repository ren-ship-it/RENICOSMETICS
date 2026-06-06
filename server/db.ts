import { and, desc, eq, gte, like, lte, sql, count, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, products, customers, orders, orderItems,
  subscribers, waitlist, contactMessages, chatLogs,
  InsertProduct, InsertCustomer, InsertOrder, InsertOrderItem,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized; updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

/**
 * Create or update a first-party admin (email + password). Used by the bootstrap
 * script. openId is synthesised for local admins so the unique constraint holds.
 */
export async function upsertLocalAdmin(email: string, passwordHash: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const openId = `local:${email.toLowerCase()}`;
  await db
    .insert(users)
    .values({ openId, email, name: name ?? email, loginMethod: "password", role: "admin", passwordHash })
    .onDuplicateKeyUpdate({ set: { passwordHash, role: "admin", name: name ?? undefined, loginMethod: "password" } });
  return getUserByOpenId(openId);
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function getAllProducts(opts?: { search?: string; available?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(products).$dynamic();
  if (opts?.search) query = query.where(like(products.name, `%${opts.search}%`));
  if (opts?.available !== undefined) query = query.where(eq(products.available, opts.available));
  return query.orderBy(desc(products.createdAt));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

/** Public catalogue. Returns all products so the storefront can show sold-out
 *  states; the client decides availability from `available` + `stockQty`. */
export async function getPublicProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(products.phase, products.id);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(products).values(data);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function getLowStockProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(sql`${products.stockQty} <= ${products.lowStockThreshold}`).orderBy(products.stockQty);
}

// ─── Customers ────────────────────────────────────────────────────────────────
export async function getAllCustomers(opts?: { search?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(customers).$dynamic();
  if (opts?.search) {
    query = query.where(sql`(${customers.email} LIKE ${`%${opts.search}%`} OR ${customers.firstName} LIKE ${`%${opts.search}%`} OR ${customers.lastName} LIKE ${`%${opts.search}%`})`);
  }
  query = query.orderBy(desc(customers.createdAt));
  if (opts?.limit) query = query.limit(opts.limit);
  if (opts?.offset) query = query.offset(opts.offset);
  return query;
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0];
}

export async function getCustomerByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
  return result[0];
}

export async function upsertCustomer(data: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(customers).values(data).onDuplicateKeyUpdate({
    set: { firstName: data.firstName, lastName: data.lastName, phone: data.phone, address: data.address, suburb: data.suburb, state: data.state, postcode: data.postcode, updatedAt: new Date() },
  });
}

export async function updateCustomer(id: number, data: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set(data).where(eq(customers.id, id));
}

export async function getCustomerCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(customers);
  return result[0]?.count ?? 0;
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function getAllOrders(opts?: { search?: string; status?: string; limit?: number; offset?: number; dateFrom?: Date; dateTo?: Date }) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(orders).$dynamic();
  if (opts?.status) query = query.where(eq(orders.status, opts.status as any));
  if (opts?.dateFrom) query = query.where(gte(orders.createdAt, opts.dateFrom));
  if (opts?.dateTo) query = query.where(lte(orders.createdAt, opts.dateTo));
  if (opts?.search) {
    query = query.where(sql`(${orders.orderNumber} LIKE ${`%${opts.search}%`} OR ${orders.customerEmail} LIKE ${`%${opts.search}%`} OR ${orders.customerName} LIKE ${`%${opts.search}%`})`);
  }
  query = query.orderBy(desc(orders.createdAt));
  if (opts?.limit) query = query.limit(opts.limit);
  if (opts?.offset) query = query.offset(opts.offset);
  return query;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderWithItems(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const order = await getOrderById(orderId);
  if (!order) return undefined;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  return { ...order, items };
}

export async function createOrder(orderData: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orders).values(orderData);
  const created = await db.select().from(orders).where(eq(orders.orderNumber, orderData.orderNumber)).limit(1);
  const newOrder = created[0];
  if (newOrder && items.length > 0) {
    await db.insert(orderItems).values(items.map(i => ({ ...i, orderId: newOrder.id })));
  }
  return newOrder;
}

export async function updateOrderStatus(id: number, status: string, trackingNumber?: string, trackingUrl?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status: status as any, ...(trackingNumber ? { trackingNumber } : {}), ...(trackingUrl ? { trackingUrl } : {}), updatedAt: new Date() }).where(eq(orders.id, id));
}

export async function getOrdersByCustomer(customerEmail: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.customerEmail, customerEmail)).orderBy(desc(orders.createdAt));
}

/** Look up an order by its public order number (used for webhook idempotency). */
export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result[0];
}

/** Decrement stock for a product by slug, never below zero. */
export async function decrementStockBySlug(slug: string, qty: number) {
  const db = await getDb();
  if (!db || qty <= 0) return;
  await db
    .update(products)
    .set({ stockQty: sql`GREATEST(0, ${products.stockQty} - ${qty})`, updatedAt: new Date() })
    .where(eq(products.slug, slug));
}

/**
 * Upsert a customer from an order and bump their lifetime totals. Keyed by the
 * unique email. Used by the Stripe webhook so the customer record and the
 * repeat-purchase / segmentation signals stay accurate after every sale.
 */
export async function applyOrderToCustomer(data: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  suburb?: string | null;
  state?: string | null;
  postcode?: string | null;
  orderTotal: number;
}) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(customers)
    .values({
      email: data.email,
      firstName: data.firstName ?? undefined,
      lastName: data.lastName ?? undefined,
      phone: data.phone ?? undefined,
      address: data.address ?? undefined,
      suburb: data.suburb ?? undefined,
      state: data.state ?? undefined,
      postcode: data.postcode ?? undefined,
      totalOrders: 1,
      totalSpent: String(data.orderTotal.toFixed(2)),
    })
    .onDuplicateKeyUpdate({
      set: {
        // Keep contact details fresh, and increment lifetime aggregates.
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        phone: data.phone ?? undefined,
        address: data.address ?? undefined,
        suburb: data.suburb ?? undefined,
        state: data.state ?? undefined,
        postcode: data.postcode ?? undefined,
        totalOrders: sql`${customers.totalOrders} + 1`,
        totalSpent: sql`${customers.totalSpent} + ${data.orderTotal}`,
        updatedAt: new Date(),
      },
    });
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0, pendingOrders: 0, lowStockCount: 0 };
  const [revenueResult] = await db.select({ total: sum(orders.total) }).from(orders).where(eq(orders.paymentStatus, "paid"));
  const [orderCount] = await db.select({ count: count() }).from(orders);
  const [customerCount] = await db.select({ count: count() }).from(customers);
  const [productCount] = await db.select({ count: count() }).from(products);
  const [pendingCount] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "pending"));
  const lowStock = await getLowStockProducts();
  return { totalRevenue: Number(revenueResult?.total ?? 0), totalOrders: orderCount?.count ?? 0, totalCustomers: customerCount?.count ?? 0, totalProducts: productCount?.count ?? 0, pendingOrders: pendingCount?.count ?? 0, lowStockCount: lowStock.length };
}

export async function getRevenueByDay(days = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(); since.setDate(since.getDate() - days);
  return db.select({ date: sql<string>`DATE(${orders.createdAt})`, revenue: sum(orders.total), orderCount: count() })
    .from(orders).where(and(gte(orders.createdAt, since), eq(orders.paymentStatus, "paid")))
    .groupBy(sql`DATE(${orders.createdAt})`).orderBy(sql`DATE(${orders.createdAt})`);
}

export async function getTopProducts(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ productName: orderItems.productName, productSlug: orderItems.productSlug, totalQty: sum(orderItems.quantity), totalRevenue: sum(orderItems.lineTotal) })
    .from(orderItems).groupBy(orderItems.productSlug, orderItems.productName).orderBy(desc(sum(orderItems.quantity))).limit(limit);
}

export async function getRecentOrders(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}

// ─── Subscribers & Waitlist ───────────────────────────────────────────────────
export async function addSubscriber(email: string, source = "footer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(subscribers).values({ email, source }).onDuplicateKeyUpdate({ set: { active: true } });
}

export async function getAllSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscribers).where(eq(subscribers.active, true)).orderBy(desc(subscribers.createdAt));
}

export async function addToWaitlist(email: string, productSlug: string, productName?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(waitlist).values({ email, productSlug, productName });
}

export async function getWaitlistByProduct(productSlug: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(waitlist).where(eq(waitlist.productSlug, productSlug)).orderBy(desc(waitlist.createdAt));
}

// ─── Contact Messages ─────────────────────────────────────────────────────────
export async function saveContactMessage(data: { name: string; email: string; subject?: string; message: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contactMessages).values(data);
}

export async function getAllContactMessages(unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(contactMessages).$dynamic();
  if (unreadOnly) query = query.where(eq(contactMessages.read, false));
  return query.orderBy(desc(contactMessages.createdAt));
}

export async function markMessageRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(contactMessages).set({ read: true }).where(eq(contactMessages.id, id));
}

export async function generateOrderNumber(): Promise<string> {
  const db = await getDb();
  if (!db) return `RC-${Date.now()}`;
  const [result] = await db.select({ count: count() }).from(orders);
  const num = (result?.count ?? 0) + 1001;
  return `RC-${num}`;
}

// ─── Chat Logs ────────────────────────────────────────────────────────────────
export async function saveChatLog(data: {
  sessionId: string;
  personaName: string;
  userMessage: string;
  assistantReply: string;
  escalated: boolean;
  isBusinessHours: boolean;
  visitorEmail?: string;
}) {
  const db = await getDb();
  if (!db) return; // non-blocking — don't throw if DB unavailable
  try {
    await db.insert(chatLogs).values(data);
  } catch (e) {
    console.warn("[Database] Failed to save chat log:", e);
  }
}

export async function getAllChatLogs(escalatedOnly = false, limit = 200) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(chatLogs).$dynamic();
  if (escalatedOnly) query = query.where(eq(chatLogs.escalated, true));
  return query.orderBy(desc(chatLogs.createdAt)).limit(limit);
}

export async function getChatLogsBySession(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatLogs)
    .where(eq(chatLogs.sessionId, sessionId))
    .orderBy(chatLogs.createdAt);
}
