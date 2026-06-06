import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import ShopGrid from "@/components/ShopGrid";
import ProtocolTeaser from "@/components/ProtocolTeaser";
import IngredientsShowcase from "@/components/IngredientsShowcase";
import ReviewsSection from "@/components/ReviewsSection";
import BrandStory from "@/components/BrandStory";
import PressStrip from "@/components/PressStrip";
import Footer from "@/components/Footer";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { useSEO } from "@/hooks/useSEO";

export default function Home() {
  useSEO({
    title: "Clinical Anti-Ageing Serums | Peptide Skincare Melbourne",
    description: "Reni Cosmetics — clinical-grade anti-ageing serums formulated with SNAP-8™, Progeline™ & Argireline®. Six biological pathways. 100% ingredient disclosure. Free shipping on Australian orders over $80. Dispatched from Melbourne.",
    url: "/",
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <PageErrorBoundary pageName="Home">
      <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
        <Navbar />
        <main>
          <HeroSection />
          <TrustStrip />
          <ShopGrid />
          <ProtocolTeaser />
          <IngredientsShowcase />
          <ReviewsSection />
          <PressStrip />
          <BrandStory />
        </main>
        <Footer />
      </div>
    </PageErrorBoundary>
  );
}
