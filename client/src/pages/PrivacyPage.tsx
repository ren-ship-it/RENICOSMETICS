import { useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";

const SECTIONS = [
  {
    title: "Who We Are",
    content: `Reni Cosmetics is a clinical anti-ageing skincare brand. ABN: 92 692 713 821, located at Epping, Victoria, Australia. We are committed to protecting your personal information in accordance with the Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).

For privacy enquiries, contact us at: privacy@renicosmetics.com.au`,
  },
  {
    title: "What Information We Collect",
    content: `We collect personal information that is reasonably necessary for our business functions. This includes:

Name, email address, phone number, and delivery address when you place an order or register an account.

Payment information — processed securely through our payment provider. We do not store full card details on our servers.

Browsing behaviour, device information, and IP address collected automatically when you visit our website (via cookies and analytics tools).

Communications you send us, including enquiry forms, support requests, and newsletter sign-ups.

We do not collect sensitive information (as defined under the Privacy Act) unless you voluntarily provide it and consent to its collection.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use your personal information to:

Process and fulfil your orders, including dispatch and delivery.

Communicate with you about your orders, returns, and support requests.

Send marketing communications (only if you have opted in — you may unsubscribe at any time).

Improve our website, products, and services through analytics.

Comply with legal obligations, including tax and consumer law requirements.

We will not use your information for purposes other than those described above without your consent.`,
  },
  {
    title: "Disclosure of Your Information",
    content: `We may share your personal information with:

Delivery and logistics providers (e.g., Australia Post, Sendle) to fulfil your orders.

Payment processors (e.g., Stripe) to process transactions securely.

Analytics providers (e.g., Google Analytics, Umami) to understand website usage.

Email marketing platforms to send newsletters and promotional communications.

We do not sell, rent, or trade your personal information to third parties for their own marketing purposes.

All third-party providers we use are required to handle your information in accordance with applicable privacy laws.`,
  },
  {
    title: "Cookies and Tracking",
    content: `Our website uses cookies and similar tracking technologies to:

Remember your preferences and cart contents.

Analyse website traffic and user behaviour.

Deliver relevant advertising (where applicable).

You can control cookie settings through your browser. Disabling cookies may affect the functionality of certain features on our website.`,
  },
  {
    title: "Data Security",
    content: `We take reasonable steps to protect your personal information from misuse, interference, loss, and unauthorised access. Our website uses SSL encryption for all data transmission.

However, no method of transmission over the internet is completely secure. We cannot guarantee the absolute security of information transmitted to or from our website.`,
  },
  {
    title: "Access and Correction",
    content: `You have the right to access the personal information we hold about you and to request corrections if it is inaccurate, incomplete, or out of date.

To make a request, contact us at privacy@renicosmetics.com.au. We will respond within 30 days. In some circumstances, we may be unable to provide access — if so, we will explain why.`,
  },
  {
    title: "Retention of Information",
    content: `We retain your personal information for as long as necessary to fulfil the purposes for which it was collected, or as required by law. Order records are typically retained for 7 years in accordance with Australian tax law.

When your information is no longer required, we will securely destroy or de-identify it.`,
  },
  {
    title: "Complaints",
    content: `If you believe we have breached the Australian Privacy Principles, you may lodge a complaint by contacting us at privacy@renicosmetics.com.au.

We will acknowledge your complaint within 5 business days and aim to resolve it within 30 days. If you are not satisfied with our response, you may contact the Office of the Australian Information Commissioner (OAIC) at www.oaic.gov.au.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. The current version will always be available on this page. We encourage you to review this policy periodically.

Last updated: March 2026.`,
  },
];

export default function PrivacyPage() {
  useSEO({
    title: "Privacy Policy | Reni Cosmetics",
    description: "Reni Cosmetics Privacy Policy — how we collect, use, and protect your personal information in accordance with the Australian Privacy Act 1988.",
    url: "/privacy",
  });
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageErrorBoundary pageName="Privacy Policy">
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
              Privacy Policy
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(234,234,223,0.5)" }}>
              Reni Cosmetics · Last updated March 2026 · Australian Privacy Act 1988 (Cth)
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
              All Reni Cosmetics products are for topical and cosmetic use only. Reni Cosmetics does not make therapeutic or TGA-registered claims. Melbourne, Victoria, Australia.
            </p>
          </div>

          {/* Back link */}
          <div className="mt-10">
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
