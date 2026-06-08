/**
 * Stripe webhook handler.
 *
 * Registered with a RAW body parser (before express.json) so the signature can
 * be verified. On `checkout.session.completed` it creates the order + line
 * items, upserts the customer and bumps lifetime totals, decrements stock, and
 * fires the downstream cascade (owner notification + analytics recompute).
 *
 * Idempotent: Stripe may deliver an event more than once, so we no-op if the
 * order number already exists.
 */
import type { Express, Request, Response } from "express";
import express from "express";
import type Stripe from "stripe";
import { getStripe } from "./_core/stripe";
import * as db from "./db";
import { emit } from "./events";
import type { InsertOrderItem } from "../drizzle/schema";

interface CheckoutItem {
  slug: string;
  name: string;
  price: number;
  qty: number;
}

function splitName(full: string | undefined): { firstName?: string; lastName?: string } {
  if (!full) return {};
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/** Parse the compact items array we stash in session metadata at checkout. */
function parseItems(meta: Record<string, string> | null | undefined): CheckoutItem[] {
  if (!meta?.items) return [];
  try {
    const raw = JSON.parse(meta.items) as Array<{ s: string; n: string; p: number; q: number }>;
    return raw.map(i => ({ slug: i.s, name: i.n, price: Number(i.p), qty: Number(i.q) }));
  } catch {
    return [];
  }
}

async function handleCompletedCheckout(session: Stripe.Checkout.Session): Promise<void> {
  const meta = (session.metadata ?? {}) as Record<string, string>;
  const orderNumber = meta.order_number;
  const email = meta.customer_email || session.customer_email || "";
  if (!orderNumber || !email) {
    console.warn("[Stripe webhook] session missing order_number/email; skipping", session.id);
    return;
  }

  // Idempotency — if we've already recorded this order, do nothing.
  const existing = await db.getOrderByNumber(orderNumber);
  if (existing) return;

  const { firstName, lastName } = splitName(meta.customer_name);
  let shipping: Record<string, string> = {};
  try {
    shipping = meta.shipping_address ? JSON.parse(meta.shipping_address) : {};
  } catch {
    shipping = {};
  }

  const items = parseItems(meta);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = typeof session.amount_total === "number" ? session.amount_total / 100 : subtotal;
  const shippingCost = Math.max(0, Math.round((total - subtotal) * 100) / 100);
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  // Resolve product ids/images and build line items.
  const orderItems: InsertOrderItem[] = [];
  for (const it of items) {
    const product = await db.getProductBySlug(it.slug).catch(() => undefined);
    orderItems.push({
      orderId: 0, // set by createOrder
      productId: product?.id,
      productSlug: it.slug,
      productName: it.name || product?.name || it.slug,
      productImage: product?.image ?? undefined,
      price: String(it.price.toFixed(2)),
      quantity: it.qty,
      lineTotal: String((it.price * it.qty).toFixed(2)),
    });
  }

  await db.createOrder(
    {
      orderNumber,
      customerEmail: email,
      customerName: meta.customer_name || undefined,
      status: "processing",
      paymentStatus: "paid",
      subtotal: String(subtotal.toFixed(2)),
      shippingCost: String(shippingCost.toFixed(2)),
      total: String(total.toFixed(2)),
      currency: (session.currency ?? "aud").toUpperCase(),
      shippingAddress: shipping,
      giftNote: meta.gift_note || undefined,
      stripePaymentIntentId: paymentIntentId,
    },
    orderItems,
  );

  // Customer record + lifetime totals (feeds segmentation / repeat-purchase).
  await db
    .applyOrderToCustomer({
      email,
      firstName,
      lastName,
      phone: shipping.phone,
      address: shipping.address,
      suburb: shipping.suburb,
      state: shipping.state,
      postcode: shipping.postcode,
      orderTotal: total,
    })
    .catch(e => console.warn("[Stripe webhook] applyOrderToCustomer failed:", e));

  // Decrement stock per line item.
  for (const it of items) {
    await db.decrementStockBySlug(it.slug, it.qty).catch(() => {});
  }

  // ── Downstream cascade ──────────────────────────────────────────────────
  // Emit one domain event; handlers (owner notification, confirmation email,
  // analytics recompute) react independently. See server/events/index.ts.
  const currency = (session.currency ?? "aud").toUpperCase();
  emit("order.paid", {
    orderNumber,
    email,
    customerName: firstName,
    items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
    subtotal,
    shippingCost,
    total,
    currency,
  });
}

export function registerStripeWebhook(app: Express): void {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      const sig = req.headers["stripe-signature"];
      if (!secret) {
        console.warn("[Stripe webhook] STRIPE_WEBHOOK_SECRET not set");
        return res.status(500).json({ error: "Webhook not configured" });
      }
      if (!sig) return res.status(400).json({ error: "Missing signature" });

      let event: Stripe.Event;
      try {
        event = getStripe().webhooks.constructEvent(req.body, sig, secret);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "invalid";
        console.warn("[Stripe webhook] signature verification failed:", msg);
        return res.status(400).send(`Webhook Error: ${msg}`);
      }

      try {
        if (event.type === "checkout.session.completed") {
          await handleCompletedCheckout(event.data.object as Stripe.Checkout.Session);
        }
      } catch (e) {
        // Acknowledge to avoid infinite retries on a non-recoverable error, but
        // log loudly so it can be investigated.
        console.error("[Stripe webhook] handler error:", e);
      }

      res.json({ received: true });
    },
  );
}
