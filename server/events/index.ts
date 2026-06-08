/**
 * Registers the default domain-event handlers. Importing this module once at
 * server startup wires the cascade. New downstream effects are added here
 * without touching the code that emits the event.
 */
import { on } from "./bus";
import { notifyOwner } from "../_core/notification";
import { sendEmail } from "../email";
import { orderConfirmationEmail } from "../email/templates";
import { recomputeCustomerInsights } from "../analytics/insights";

let registered = false;

export function registerEventHandlers(): void {
  if (registered) return;
  registered = true;

  // A paid order cascades to: owner notification, customer confirmation email,
  // and an analytics/segmentation recompute. (Order + stock are written before
  // the event is emitted; these are the non-blocking downstream effects.)
  on("order.paid", payload => {
    notifyOwner({
      title: `New paid order ${payload.orderNumber}`,
      content:
        `From: ${payload.customerName || payload.email} (${payload.email})\n` +
        `Total: $${payload.total.toFixed(2)} ${payload.currency}\n` +
        `Items: ${payload.items.map(i => `${i.qty}× ${i.name}`).join(", ") || "n/a"}`,
    }).catch(() => {});

    const confirmation = orderConfirmationEmail({
      orderNumber: payload.orderNumber,
      customerName: payload.customerName,
      items: payload.items.map(i => ({ name: i.name, quantity: i.qty, lineTotal: i.price * i.qty })),
      subtotal: payload.subtotal,
      shippingCost: payload.shippingCost,
      total: payload.total,
      currency: payload.currency,
    });
    sendEmail({ to: payload.email, ...confirmation }).catch(() => {});

    recomputeCustomerInsights().catch(() => {});
  });
}

export { emit, on } from "./bus";
