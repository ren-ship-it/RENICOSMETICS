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
