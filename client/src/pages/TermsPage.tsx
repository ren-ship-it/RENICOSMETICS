import { useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    content: `By accessing or using the Reni Cosmetics website (renicosmetics.com.au) or placing an order, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use this website or place an order.

These Terms and Conditions are governed by the laws of Victoria, Australia. Any disputes arising from your use of this website or any purchase will be subject to the exclusive jurisdiction of the courts of Victoria, Australia.`,
  },
  {
    title: "About Reni Cosmetics",
    content: `Reni Cosmetics is a clinical anti-ageing skincare brand based in Melbourne, Victoria, Australia.

ABN: 92 692 713 821
Email: hello@renicosmetics.com.au
Warehouse: Epping, VIC 3076, Australia

All products are formulated for topical and cosmetic use only. Reni Cosmetics does not make therapeutic or TGA-registered claims.`,
  },
  {
    title: "Products and Descriptions",
    content: `We take care to ensure that all product descriptions, images, ingredient lists, and pricing information on this website are accurate. However, we do not warrant that product descriptions or other content is error-free, complete, or current.

All products are intended for topical, cosmetic use only. They are not medicines, therapeutic goods, or TGA-registered products. If you have a medical condition, skin condition, or are pregnant or breastfeeding, consult a qualified healthcare professional before use.

Product images are for illustrative purposes. Minor variations in colour or appearance may occur due to screen calibration differences.`,
  },
  {
    title: "Pricing and Payment",
    content: `All prices are displayed in Australian Dollars (AUD) and include GST where applicable. Prices are subject to change without notice. The price charged will be the price displayed at the time your order is placed.

A minimum order value of $150 AUD applies to all orders. Orders below this threshold cannot be processed.

Payment is processed securely via Stripe. We accept major credit and debit cards (Visa, Mastercard, American Express). We do not store your full card details on our servers.

Free standard shipping applies to Australian orders over $150 AUD. Shipping costs for orders below this threshold are displayed at checkout.`,
  },
  {
    title: "Order Processing and Fulfilment",
    content: `By placing an order, you make an offer to purchase the selected products at the stated price. We reserve the right to accept or decline any order at our discretion.

Order confirmation is sent to your nominated email address upon successful payment. This confirmation does not constitute acceptance of your order — acceptance occurs when your order is dispatched.

We aim to dispatch all orders within 1 business day of payment confirmation (Monday–Friday, excluding Victorian public holidays). Dispatch times are estimates only and are not guaranteed.

We reserve the right to cancel orders where products are out of stock, where pricing errors have occurred, or where we suspect fraudulent activity. In such cases, a full refund will be issued.`,
  },
  {
    title: "Shipping",
    content: `We currently ship to Australian addresses only. International shipping is not available at this time.

Delivery timeframes are estimates provided by our carrier partners (Australia Post, Sendle) and are not guaranteed. We are not liable for delays caused by carriers, customs, or circumstances outside our control.

Risk of loss and title for products pass to you upon delivery to the nominated delivery address. If you are not present at delivery, the carrier's standard procedures apply.

For full shipping rates and timeframes, see our Shipping & Returns page.`,
  },
  {
    title: "Returns and Refunds",
    content: `We offer a 30-day return policy for unopened, sealed products in their original packaging. Products must be unused and in a resalable condition.

To initiate a return, contact hello@renicosmetics.com.au with your order number and reason for return within 30 days of delivery. We will issue a return authorisation and prepaid return label within 2 business days.

Refunds are processed to the original payment method within 5–7 business days of receiving and inspecting the returned product.

The following items are not eligible for return: opened or used products, gift cards, and items purchased during final-sale promotions.

Nothing in this policy limits or excludes your rights under the Australian Consumer Law. If a product has a major fault, you are entitled to a replacement, repair, or refund regardless of this policy.`,
  },
  {
    title: "Australian Consumer Law",
    content: `Our products come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage. You are also entitled to have the products repaired or replaced if the products fail to be of acceptable quality and the failure does not amount to a major failure.

Nothing in these Terms and Conditions is intended to exclude, restrict, or modify any rights you have under the Australian Consumer Law.`,
  },
  {
    title: "Intellectual Property",
    content: `All content on this website — including text, images, product names, logos, trademarks, and design — is the intellectual property of Reni Cosmetics or its licensors and is protected by Australian and international copyright and trademark law.

The product names NEUROVÉCTRIX™, RECEPTORLIFT™, CHRONOVÉCTRIX™, and associated marks are trademarks of Reni Cosmetics. Unauthorised use of these marks is prohibited.

You may not reproduce, distribute, modify, or create derivative works from any content on this website without our prior written consent.`,
  },
  {
    title: "Limitation of Liability",
    content: `To the maximum extent permitted by law, Reni Cosmetics is not liable for any indirect, incidental, special, or consequential loss or damage arising from your use of this website or any products purchased, including but not limited to loss of profits, loss of data, or personal injury.

Our total liability to you for any claim arising from your use of this website or purchase of products is limited to the amount you paid for the relevant product.

We do not warrant that this website will be available at all times, free from errors, or free from viruses or other harmful components.`,
  },
  {
    title: "Privacy",
    content: `Your use of this website is also governed by our Privacy Policy, which is incorporated into these Terms and Conditions by reference. By using this website, you consent to the collection and use of your personal information as described in our Privacy Policy.`,
  },
  {
    title: "Marketing Communications",
    content: `By subscribing to our newsletter or marketing communications, you consent to receive commercial electronic messages from Reni Cosmetics in accordance with the Spam Act 2003 (Cth). You may unsubscribe at any time by clicking the unsubscribe link in any email or by contacting us at hello@renicosmetics.com.au.`,
  },
  {
    title: "Changes to These Terms",
    content: `We may update these Terms and Conditions at any time. The current version will always be available on this page. Continued use of this website after changes are posted constitutes your acceptance of the revised terms.

Last updated: March 2026.`,
  },
];

export default function TermsPage() {
  useSEO({
    title: "Terms & Conditions | Reni Cosmetics",
    description: "Reni Cosmetics Terms and Conditions — governing your use of our website and purchase of our products under Australian Consumer Law.",
    url: "/terms",
  });
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageErrorBoundary pageName="Terms & Conditions">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

        {/* Page header */}
        <div
          className="pt-36 pb-16"
          style={{ background: "#2D2C2C", borderBottom: "1px solid rgba(234,234,223,0.08)" }}
        >
          <div className="container max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ background: "rgba(234,234,223,0.25)" }} />
              <span className="text-[10px] tracking-[0.22em] uppercase font-medium" style={{ color: "rgba(234,234,223,0.4)" }}>
                Legal
              </span>
            </div>
            <h1
              className="font-display font-light mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#EAEADF", lineHeight: 1.1 }}
            >
              Terms &amp; Conditions
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(234,234,223,0.5)" }}>
              Reni Cosmetics · Last updated March 2026 · Governed by the laws of Victoria, Australia
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-3xl py-20">
          <div className="space-y-12">
            {SECTIONS.map((section, i) => (
              <div key={i} className="border-t pt-10" style={{ borderColor: "rgba(45,44,44,0.1)" }}>
                <div className="flex items-start gap-6">
                  <span
                    className="font-display font-light flex-shrink-0 mt-1"
                    style={{ fontSize: "clamp(1.2rem, 3vw, 1.6rem)", color: "rgba(45,44,44,0.12)", lineHeight: 1 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <h2
                      className="font-display font-medium mb-4"
                      style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)", color: "#2D2C2C" }}
                    >
                      {section.title}
                    </h2>
                    <div className="space-y-3">
                      {section.content.split("\n\n").map((para, j) => (
                        <p key={j} className="text-sm leading-relaxed" style={{ color: "rgba(45,44,44,0.65)" }}>
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div
            className="mt-16 p-6"
            style={{ background: "#EAEADF", borderLeft: "3px solid #2D2C2C" }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.7)" }}>
              All Reni Cosmetics products are for topical and cosmetic use only. Reni Cosmetics does not make therapeutic or TGA-registered claims. These Terms and Conditions do not affect your statutory rights under the Australian Consumer Law. For legal enquiries, contact hello@renicosmetics.com.au.
            </p>
          </div>

          {/* Navigation links */}
          <div className="mt-10 flex flex-wrap gap-6">
            <Link href="/privacy" className="text-xs tracking-widest uppercase font-medium hover:opacity-70 transition-opacity" style={{ color: "#2D2C2C" }}>
              Privacy Policy →
            </Link>
            <Link href="/shipping" className="text-xs tracking-widest uppercase font-medium hover:opacity-70 transition-opacity" style={{ color: "#2D2C2C" }}>
              Shipping &amp; Returns →
            </Link>
            <Link href="/" className="text-xs tracking-widest uppercase font-medium hover:opacity-70 transition-opacity" style={{ color: "#2D2C2C" }}>
              ← Return to Homepage
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
