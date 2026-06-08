/**
 * Lightweight, typed in-process domain-event bus.
 *
 * Enables event-driven, cascading behaviour: a part of the system emits a
 * domain event and any number of handlers react, without the emitter knowing
 * about them. Handlers are isolated (one failing handler never breaks another or
 * the emitter) and run fire-and-forget so request latency is unaffected.
 *
 * This is deliberately simple (single process). It can be swapped for a durable
 * queue later without changing emit sites.
 */

export interface DomainEvents {
  "order.paid": {
    orderNumber: string;
    email: string;
    customerName?: string;
    items: Array<{ name: string; qty: number; price: number }>;
    subtotal: number;
    shippingCost: number;
    total: number;
    currency: string;
  };
  "stock.changed": { slug: string; newQty: number };
  "customer.signup": { customerId: number; email: string };
}

type EventName = keyof DomainEvents;
type Handler<E extends EventName> = (payload: DomainEvents[E]) => void | Promise<void>;

// Internal storage is loosely typed; the public API below is fully typed.
const handlers: Record<string, Array<(payload: unknown) => void | Promise<void>>> = {};

export function on<E extends EventName>(event: E, handler: Handler<E>): void {
  (handlers[event] ??= []).push(handler as (payload: unknown) => void | Promise<void>);
}

/** Emit an event. Handlers run fire-and-forget and are individually isolated. */
export function emit<E extends EventName>(event: E, payload: DomainEvents[E]): void {
  const list = handlers[event];
  if (!list || list.length === 0) return;
  for (const handler of list) {
    Promise.resolve()
      .then(() => handler(payload))
      .catch(err => console.warn(`[events] handler for "${event}" failed:`, err));
  }
}
