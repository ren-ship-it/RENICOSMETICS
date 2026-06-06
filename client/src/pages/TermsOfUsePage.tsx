import { useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";

const SECTIONS = [
  {
    title: "Acceptance of Website Terms",
    content: `By accessing and browsing the Reni Cosmetics website (renicosmetics.com.au), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please discontinue use of this website immediately.

These Terms of Use govern your general use of the website. For terms relating to purchases, please refer to our Terms & Conditions.`,
  },
  {
    title: "Website Content and Accuracy",
    content: `The information on this website — including product descriptions, ingredient information, clinical references, and educational content — is provided for general informational and cosmetic guidance purposes only. It does not constitute medical advice, dermatological advice, or a substitute for professional healthcare consultation.

While we take reasonable care to ensure the accuracy of information on this website, we do not warrant that all content is complete, current, or error-free. We reserve the right to update, modify, or remove content at any time without notice.

Clinical references and ingredient efficacy data cited on this website are sourced from ingredient supplier documentation and published research. Reni Cosmetics does not make therapeutic claims. Individual results may vary.`,
  },
  {
    title: "Cosmetic Use Only",
    content: `All Reni Cosmetics products are formulated for topical, external, cosmetic use only. They are not medicines, therapeutic goods, or TGA-registered products. Nothing on this website should be interpreted as a claim that our products diagnose, treat, cure, or prevent any disease or medical condition.

If you have a diagnosed skin condition, medical condition, allergy, or are pregnant or breastfeeding, consult a qualified healthcare professional before using any cosmetic product.`,
  },
  {
    title: "Intellectual Property",
    content: `All content on this website — including but not limited to text, images, graphics, logos, product names, trademarks, and the overall design — is the property of Reni Cosmetics or its content suppliers and is protected by Australian and international intellectual property laws.

You may view, download, and print content from this website for personal, non-commercial use only. You must not reproduce, republish, distribute, sell, or create derivative works from any content without our prior written consent.

The product names NEUROVÉCTRIX™, RECEPTORLIFT™, CHRONOVÉCTRIX™, and all associated marks are trademarks of Reni Cosmetics. Unauthorised use of these marks is strictly prohibited.`,
  },
  {
    title: "Prohibited Uses",
    content: `You must not use this website:

To engage in any unlawful, fraudulent, or harmful activity.

To transmit any unsolicited commercial communications (spam).

To attempt to gain unauthorised access to any part of this website or its underlying systems.

To upload or transmit viruses, malware, or any other malicious code.

To scrape, harvest, or collect data from this website using automated tools without our prior written consent.

To impersonate Reni Cosmetics or any of its staff or representatives.`,
  },
  {
    title: "Third-Party Links",
    content: `This website may contain links to third-party websites (including ingredient supplier websites, research publications, and social media platforms). These links are provided for convenience and informational purposes only.

We do not endorse, control, or take responsibility for the content, privacy practices, or accuracy of any third-party website. Your use of third-party websites is at your own risk and subject to their own terms and conditions.`,
  },
  {
    title: "Disclaimer of Warranties",
    content: `This website is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, Reni Cosmetics makes no representations or warranties of any kind, express or implied, regarding the operation of this website or the information, content, or materials included on it.

We do not warrant that this website will be uninterrupted, error-free, or free from viruses or other harmful components. We do not warrant the accuracy, completeness, or currency of any information on this website.`,
  },
  {
    title: "Limitation of Liability",
    content: `To the maximum extent permitted by applicable law, Reni Cosmetics and its directors, employees, and agents are not liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of, or inability to use, this website or its content.

This limitation of liability does not apply to liability that cannot be excluded under the Australian Consumer Law or other applicable legislation.`,
  },
  {
    title: "Privacy",
    content: `Your use of this website is subject to our Privacy Policy, which explains how we collect, use, and protect your personal information. By using this website, you consent to the practices described in our Privacy Policy.`,
  },
  {
    title: "Changes to These Terms",
    content: `We may update these Terms of Use at any time by posting revised terms on this page. Your continued use of this website after any changes constitutes acceptance of the revised terms. We encourage you to review these terms periodically.

Last updated: March 2026.`,
  },
];

export default function TermsOfUsePage() {
  useSEO({
    title: "Terms of Use | Reni Cosmetics",
    description: "Reni Cosmetics Terms of Use — governing your general use of our website, including intellectual property, disclaimers, and limitations of liability.",
    url: "/terms-of-use",
  });
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageErrorBoundary pageName="Terms of Use">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />

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
              Terms of Use
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(234,234,223,0.5)" }}>
              Reni Cosmetics · Last updated March 2026 · Governing your use of renicosmetics.com.au
            </p>
          </div>
        </div>

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

          <div
            className="mt-16 p-6"
            style={{ background: "#EAEADF", borderLeft: "3px solid #2D2C2C" }}
          >
            <p className="text-xs leading-relaxed" style={{ color: "rgba(45,44,44,0.7)" }}>
              All Reni Cosmetics products are for topical and cosmetic use only. No therapeutic claims are made. These Terms of Use do not affect your statutory rights under the Australian Consumer Law.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-6">
            <Link href="/terms" className="text-xs tracking-widest uppercase font-medium hover:opacity-70 transition-opacity" style={{ color: "#2D2C2C" }}>
              Terms &amp; Conditions →
            </Link>
            <Link href="/privacy" className="text-xs tracking-widest uppercase font-medium hover:opacity-70 transition-opacity" style={{ color: "#2D2C2C" }}>
              Privacy Policy →
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
