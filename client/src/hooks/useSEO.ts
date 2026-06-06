import { useEffect } from "react";

interface ProductSchema {
  type: "product";
  name: string;
  description: string;
  price: string;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  sku?: string;
  brand?: string;
  image?: string;
}

interface ArticleSchema {
  type: "article";
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  image?: string;
}

interface FAQSchema {
  type: "faq";
  questions: Array<{ question: string; answer: string }>;
}

type StructuredData = ProductSchema | ArticleSchema | FAQSchema;

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  structuredData?: StructuredData;
  noindex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  keywords?: string;
}

const BRAND = "Reni Cosmetics";
const DEFAULT_IMAGE = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795/qiRyrUiSwYwLhIls.jpg";
const BASE_URL = "https://renicosmetics.com.au";

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string) {
  let el = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

function setStructuredData(data: object, id = "reni-structured-data") {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("id", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeStructuredData(id = "reni-structured-data") {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function buildStructuredData(sd: StructuredData): object {
  if (sd.type === "product") {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: sd.name,
      description: sd.description,
      brand: {
        "@type": "Brand",
        name: sd.brand ?? BRAND,
      },
      image: sd.image ?? DEFAULT_IMAGE,
      sku: sd.sku,
      offers: {
        "@type": "Offer",
        priceCurrency: sd.currency ?? "AUD",
        price: sd.price,
        availability: `https://schema.org/${sd.availability ?? "InStock"}`,
        seller: {
          "@type": "Organization",
          name: BRAND,
        },
        url: `${BASE_URL}/shop`,
      },
    };
  }

  if (sd.type === "article") {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: sd.headline,
      description: sd.description,
      image: sd.image ?? DEFAULT_IMAGE,
      datePublished: sd.datePublished,
      dateModified: sd.dateModified ?? sd.datePublished,
      author: {
        "@type": "Person",
        name: sd.author ?? "Reni Cosmetics Editorial",
      },
      publisher: {
        "@type": "Organization",
        name: BRAND,
        logo: {
          "@type": "ImageObject",
          url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795/hMvCPNXLdbYPQXii.png",
        },
      },
    };
  }

  if (sd.type === "faq") {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: sd.questions.map(q => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.answer,
        },
      })),
    };
  }

  return {};
}

export function useSEO({ title, description, image, url, type = "website", structuredData, noindex, breadcrumbs }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${BRAND}`;
    document.title = fullTitle;

    const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL;

    setMeta("description", description);
    setMeta("robots", noindex ? "noindex,nofollow" : "index,follow");
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:image", image ?? DEFAULT_IMAGE, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", BRAND, true);
    setMeta("og:locale", "en_AU", true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image ?? DEFAULT_IMAGE);

    // Canonical tag
    setCanonical(canonicalUrl);

    // Keywords meta
    if (typeof (window as any).__seoKeywords === 'string') {
      setMeta("keywords", (window as any).__seoKeywords);
    }

    // Breadcrumb schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      setStructuredData({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: item.name,
          item: `${BASE_URL}${item.url}`,
        })),
      }, "reni-breadcrumb-schema");
    }

    // Organization schema — always present
    setStructuredData({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: BRAND,
      url: BASE_URL,
      logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663375502795/hMvCPNXLdbYPQXii.png",
      contactPoint: {
        "@type": "ContactPoint",
        email: "hello@renicosmetics.com.au",
        contactType: "customer service",
        areaServed: "AU",
        availableLanguage: "English",
      },
      sameAs: [
        "https://instagram.com/renicosmetics",
        "https://facebook.com/renicosmetics",
        "https://tiktok.com/@renicosmetics",
      ],
    }, "reni-org-schema");

    // LocalBusiness schema — helps Google Maps and local search
    setStructuredData({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${BASE_URL}/#business`,
      name: BRAND,
      url: BASE_URL,
      telephone: "+61-3-0000-0000",
      email: "hello@renicosmetics.com.au",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Epping",
        addressRegion: "VIC",
        addressCountry: "AU",
      },
      priceRange: "$$$",
      currenciesAccepted: "AUD",
      paymentAccepted: "Credit Card, Debit Card",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
      ],
    }, "reni-localbusiness-schema");

    // Page-specific structured data
    if (structuredData) {
      setStructuredData(buildStructuredData(structuredData), "reni-structured-data");
    } else {
      removeStructuredData("reni-structured-data");
    }

    return () => {
      removeStructuredData("reni-structured-data");
      removeStructuredData("reni-breadcrumb-schema");
    };
  }, [title, description, image, url, type, structuredData, noindex, breadcrumbs]);
}
