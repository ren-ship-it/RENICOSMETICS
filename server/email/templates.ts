/**
 * Branded transactional email templates.
 *
 * Plain, robust HTML (table-free, inline styles) that renders across clients,
 * using the Reni "Dark Science Editorial" palette. No third-party branding.
 */

const OBSIDIAN = "#2D2C2C";
const ALABASTER = "#FAFAF7";
const PARCHMENT = "#EAEADF";
const SAGE = "#6B7A3E";
const MUTED = "#6b6a68";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:${ALABASTER};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${OBSIDIAN};">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="background:${OBSIDIAN};padding:28px 24px;border-radius:8px 8px 0 0;text-align:center;">
      <div style="color:${SAGE};font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Reni Cosmetics</div>
      <div style="color:${PARCHMENT};font-size:20px;margin-top:6px;font-weight:300;">${title}</div>
    </div>
    <div style="background:#ffffff;border:1px solid rgba(45,44,44,0.1);border-top:none;padding:28px 24px;border-radius:0 0 8px 8px;">
      ${bodyHtml}
    </div>
    <div style="text-align:center;color:${MUTED};font-size:11px;margin-top:20px;line-height:1.6;">
      Reni Cosmetics · Melbourne, Australia · ABN 92 692 713 821<br>
      All products are for topical and cosmetic use only.<br>
      <a href="https://renicosmetics.com.au/privacy" style="color:${MUTED};">Privacy Policy</a>
    </div>
  </div>
</body></html>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${OBSIDIAN};color:${ALABASTER};text-decoration:none;padding:13px 28px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;border-radius:4px;">${label}</a>`;
}

const p = (text: string) =>
  `<p style="font-size:14px;line-height:1.6;color:rgba(45,44,44,0.8);margin:0 0 16px;">${text}</p>`;

export function welcomeEmail(firstName?: string | null): EmailContent {
  const name = firstName ? ` ${firstName}` : "";
  const body = `${p(`Welcome${name}. Your Reni Cosmetics account is ready.`)}
${p("You can now track orders, manage your details and update your communication preferences anytime.")}
<div style="text-align:center;margin:24px 0;">${button("https://renicosmetics.com.au/account", "View Your Account")}</div>
${p("Mechanism over marketing. Always.")}`;
  return {
    subject: "Welcome to Reni Cosmetics",
    html: shell("Welcome", body),
    text: `Welcome${name}. Your Reni Cosmetics account is ready. Manage it at https://renicosmetics.com.au/account`,
  };
}

export function passwordResetEmail(resetUrl: string): EmailContent {
  const body = `${p("We received a request to reset your Reni Cosmetics password.")}
${p("This link expires in 1 hour and can be used once. If you didn't request it, you can safely ignore this email.")}
<div style="text-align:center;margin:24px 0;">${button(resetUrl, "Reset Password")}</div>
<p style="font-size:11px;color:${MUTED};word-break:break-all;">Or paste this link into your browser:<br>${resetUrl}</p>`;
  return {
    subject: "Reset your Reni Cosmetics password",
    html: shell("Password Reset", body),
    text: `Reset your Reni Cosmetics password (expires in 1 hour, single use): ${resetUrl}`,
  };
}

export function backInStockEmail(productName: string, slug: string): EmailContent {
  const url = `https://renicosmetics.com.au/products/${slug}`;
  const body = `${p(`Good news — ${productName} is back in stock.`)}
${p("You asked us to let you know. Stock on our clinical serums can move quickly, so we'd grab it while it's available.")}
<div style="text-align:center;margin:24px 0;">${button(url, "Shop Now")}</div>`;
  return {
    subject: `Back in stock: ${productName}`,
    html: shell("Back in Stock", body),
    text: `${productName} is back in stock: ${url}`,
  };
}

export interface DigestAlert { severity: string; title: string; recommendedAction: string }

export function digestEmail(args: {
  subject: string;
  periodLabel: string;
  metrics: Array<{ label: string; value: string }>;
  alerts: DigestAlert[];
}): EmailContent {
  const metricRows = args.metrics
    .map(m => `<tr><td style="padding:6px 0;font-size:13px;color:${MUTED};">${m.label}</td><td style="padding:6px 0;font-size:13px;text-align:right;color:${OBSIDIAN};font-weight:600;">${m.value}</td></tr>`)
    .join("");
  const alertItems = args.alerts.length
    ? args.alerts
        .map(
          a =>
            `<div style="border-left:3px solid ${a.severity === "critical" ? "#b3261e" : a.severity === "high" ? "#b58900" : "#6B7A3E"};padding:8px 12px;margin:0 0 8px;background:#f5f5f0;">
              <div style="font-size:12px;font-weight:700;color:${OBSIDIAN};">${a.title} <span style="font-weight:400;color:${MUTED};">(${a.severity})</span></div>
              <div style="font-size:12px;color:${MUTED};">${a.recommendedAction}</div>
            </div>`,
        )
        .join("")
    : `${p("No alerts — nothing needs attention.")}`;

  const body = `${p(`Here is your ${args.periodLabel} business summary.`)}
<table style="width:100%;border-collapse:collapse;margin-bottom:18px;">${metricRows}</table>
<p style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 8px;">Alerts</p>
${alertItems}
<div style="text-align:center;margin:22px 0;">${button("https://renicosmetics.com.au/admin/intelligence", "Open Intelligence")}</div>`;

  const text =
    `${args.periodLabel} summary\n` +
    args.metrics.map(m => `${m.label}: ${m.value}`).join("\n") +
    `\n\nAlerts:\n` +
    (args.alerts.length ? args.alerts.map(a => `- [${a.severity}] ${a.title} — ${a.recommendedAction}`).join("\n") : "None");

  return { subject: args.subject, html: shell("Business Digest", body), text };
}

export function refundEmail(o: { orderNumber: string; customerName?: string; amount?: number; currency?: string }): EmailContent {
  const amt = o.amount !== undefined ? `$${o.amount.toFixed(2)}${o.currency ? ` ${o.currency}` : ""}` : "your payment";
  const body = `${p(`Hi${o.customerName ? ` ${o.customerName}` : ""}, we've processed a refund of ${amt} for order ${o.orderNumber}.`)}
${p("Refunds usually take 5 to 10 business days to appear on your statement, depending on your bank. If you have any questions, just reply to this email or contact hello@renicosmetics.com.au.")}`;
  return {
    subject: `Refund processed — ${o.orderNumber}`,
    html: shell("Refund Processed", body),
    text: `We've refunded ${amt} for order ${o.orderNumber}. Allow 5-10 business days.`,
  };
}

export function shipmentEmail(o: { orderNumber: string; customerName?: string; trackingNumber?: string; trackingUrl?: string }): EmailContent {
  const tracking = o.trackingNumber
    ? `<p style="font-size:13px;color:${MUTED};margin:0 0 16px;">Tracking: <b style="color:${OBSIDIAN};">${o.trackingNumber}</b></p>`
    : "";
  const cta = o.trackingUrl ? `<div style="text-align:center;margin:24px 0;">${button(o.trackingUrl, "Track Your Order")}</div>` : "";
  const body = `${p(`Good news${o.customerName ? `, ${o.customerName}` : ""} — your order ${o.orderNumber} is on its way.`)}
${tracking}${cta}
${p("Standard delivery is typically 2 to 3 business days within Australia.")}`;
  return {
    subject: `Your order has shipped — ${o.orderNumber}`,
    html: shell("On Its Way", body),
    text: `Your order ${o.orderNumber} has shipped.${o.trackingNumber ? ` Tracking: ${o.trackingNumber}.` : ""}${o.trackingUrl ? ` ${o.trackingUrl}` : ""}`,
  };
}

export interface OrderEmailData {
  orderNumber: string;
  customerName?: string;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
}

export function orderConfirmationEmail(o: OrderEmailData): EmailContent {
  const rows = o.items
    .map(
      it =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(45,44,44,0.08);font-size:13px;">${it.quantity}× ${it.name}</td><td style="padding:8px 0;border-bottom:1px solid rgba(45,44,44,0.08);font-size:13px;text-align:right;">$${it.lineTotal.toFixed(2)}</td></tr>`,
    )
    .join("");
  const body = `${p(`Thank you${o.customerName ? `, ${o.customerName}` : ""}. We've received your order and it's being prepared for dispatch.`)}
<p style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 8px;">Order ${o.orderNumber}</p>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
  ${rows}
  <tr><td style="padding:8px 0;font-size:13px;color:${MUTED};">Subtotal</td><td style="padding:8px 0;font-size:13px;text-align:right;">$${o.subtotal.toFixed(2)}</td></tr>
  <tr><td style="padding:4px 0;font-size:13px;color:${MUTED};">Shipping</td><td style="padding:4px 0;font-size:13px;text-align:right;">${o.shippingCost === 0 ? "Free" : `$${o.shippingCost.toFixed(2)}`}</td></tr>
  <tr><td style="padding:8px 0;font-size:14px;font-weight:600;">Total (${o.currency})</td><td style="padding:8px 0;font-size:14px;font-weight:600;text-align:right;">$${o.total.toFixed(2)}</td></tr>
</table>
${p("We'll email you tracking details as soon as your order ships, usually within 1 business day.")}
<div style="text-align:center;margin:24px 0;">${button("https://renicosmetics.com.au/account", "View Order")}</div>`;
  return {
    subject: `Order confirmed — ${o.orderNumber}`,
    html: shell("Order Confirmed", body),
    text: `Thank you for your order ${o.orderNumber}. Total $${o.total.toFixed(2)} ${o.currency}. View it at https://renicosmetics.com.au/account`,
  };
}
