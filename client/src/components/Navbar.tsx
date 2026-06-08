import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, ChevronDown, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

// Cream/white logo — always used (navbar is always dark-bg or white-bg)
import { ASSETS } from "@/data/assets";
const LOGO_CREAM = ASSETS.logoCream;
const LOGO_DARK = ASSETS.logoDark;

// Shop dropdown items — The Bundle is now a subcategory of Shop
const SHOP_ITEMS = [
  { label: "Shop All", href: "/shop" },
  { label: "The Bundle", href: "/bundle" },
  { label: "The System", href: "/system" },
  { label: "Our Science", href: "/science" },
  { label: "Layering Guide", href: "/layering-guide" },
  { label: "About Reni", href: "/about" },
];

// Mobile: flat list of all pages
const mobileMainLinks = [
  { label: "Shop All", href: "/shop" },
  { label: "The Bundle", href: "/bundle" },
  { label: "The System", href: "/system" },
  { label: "Our Science", href: "/science" },
  { label: "Layering Guide", href: "/layering-guide" },
  { label: "About Reni", href: "/about" },
  { label: "Journal", href: "/journal" },
  { label: "Find Your Protocol", href: "/quiz" },
  { label: "Contact Us", href: "/contact" },
];

const mobileSupportLinks = [
  { label: "Help Centre", href: "/help" },
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "FAQ", href: "/faq" },
  { label: "Stockists", href: "/stockists" },
  { label: "Refer a Friend", href: "/referral" },
];

// Pages where the hero is dark — navbar starts transparent with white text
const DARK_HERO_PAGES = ["/", "/bundle", "/system", "/science", "/faq", "/stockists"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [location] = useLocation();
  const { count } = useCart();
  const shopRef = useRef<HTMLDivElement>(null);

  const hasDarkHero = DARK_HERO_PAGES.includes(location);

  useEffect(() => {
    setScrolled(window.scrollY > 60);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location]);

  // Close shop dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); setShopOpen(false); }, [location]);

  // Style logic:
  // - Transparent: always show dark semi-transparent bg + white text
  // - Scrolled: solid cream bg + dark text
  const transparent = !scrolled;

  const navBg = transparent
    ? "rgba(20,19,19,0.55)"
    : "rgba(250,250,247,0.97)";

  const textColor = transparent
    ? "rgba(234,234,223,0.92)"
    : "rgba(45,44,44,0.82)";

  const iconColor = transparent
    ? "rgba(234,234,223,0.88)"
    : "rgba(45,44,44,0.72)";

  const activeUnderlineColor = transparent
    ? "rgba(234,234,223,0.5)"
    : "rgba(45,44,44,0.4)";

  const isShopActive = ["/shop", "/bundle", "/system", "/science"].includes(location);

  return (
    <>
      <nav
        className="fixed left-0 right-0 z-50 transition-all duration-300"
        style={{
          top: 0,
          background: navBg,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: transparent
            ? "1px solid rgba(234,234,223,0.08)"
            : "1px solid rgba(45,44,44,0.08)",
        }}
      >
        <div className="container">
          <div className="flex items-center justify-between" style={{ height: "140px" }}>

            {/* Logo */}
            <Link href="/">
              <img
                src={transparent ? LOGO_CREAM : LOGO_DARK}
                alt="Reni Cosmetics"
                className="w-auto object-contain cursor-pointer transition-all duration-300"
                style={{
                  height: "clamp(110px, 16vw, 200px)",
                  imageRendering: "crisp-edges",
                }}
              />
            </Link>

            {/* Desktop Nav — 4 items */}
            <div className="hidden md:flex items-center gap-8">

              {/* 1. Shop dropdown */}
              <div ref={shopRef} className="relative">
                <button
                  className="flex items-center gap-1.5 text-[11px] font-medium tracking-widest uppercase transition-all duration-200 hover:opacity-60"
                  style={{
                    color: textColor,
                    borderBottom: isShopActive ? `1px solid ${activeUnderlineColor}` : "none",
                    paddingBottom: isShopActive ? "3px" : "0",
                    fontWeight: isShopActive ? 600 : 500,
                    background: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setShopOpen(v => !v)}
                  aria-expanded={shopOpen}
                  aria-haspopup="true"
                >
                  Shop
                  <ChevronDown
                    size={11}
                    style={{
                      transition: "transform 0.2s",
                      transform: shopOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {/* Dropdown panel */}
                {shopOpen && (
                  <div
                    className="absolute top-full left-0 mt-3 py-2 min-w-[180px] z-50"
                    style={{
                      background: "rgba(250,250,247,0.98)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1px solid rgba(45,44,44,0.1)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    }}
                  >
                    {SHOP_ITEMS.map(({ label, href }) => (
                      <Link key={label} href={href}>
                        <span
                          className="block px-5 py-3 text-[11px] font-medium tracking-widest uppercase cursor-pointer transition-colors hover:opacity-60"
                          style={{
                            color: location === href ? "#2D2C2C" : "rgba(45,44,44,0.65)",
                            fontWeight: location === href ? 600 : 500,
                          }}
                          onClick={() => setShopOpen(false)}
                        >
                          {label}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Journal */}
              <Link href="/journal">
                <span
                  className="text-[11px] font-medium tracking-widest uppercase transition-all duration-200 cursor-pointer hover:opacity-60"
                  style={{
                    color: textColor,
                    borderBottom: location === "/journal" ? `1px solid ${activeUnderlineColor}` : "none",
                    paddingBottom: location === "/journal" ? "3px" : "0",
                    fontWeight: location === "/journal" ? 600 : 500,
                  }}
                >
                  Journal
                </span>
              </Link>

              {/* 3. Contact Us */}
              <Link href="/contact">
                <span
                  className="text-[11px] font-medium tracking-widest uppercase transition-all duration-200 cursor-pointer hover:opacity-60"
                  style={{
                    color: textColor,
                    borderBottom: location === "/contact" ? `1px solid ${activeUnderlineColor}` : "none",
                    paddingBottom: location === "/contact" ? "3px" : "0",
                    fontWeight: location === "/contact" ? 600 : 500,
                  }}
                >
                  Contact
                </span>
              </Link>

              {/* 4. Find Your Protocol — CTA pill */}
              <Link href="/quiz">
                <span
                  className="text-[11px] font-semibold tracking-widest uppercase transition-all duration-200 cursor-pointer px-5 py-2.5 hover:opacity-80"
                  style={{
                    color: transparent ? "#1a1919" : "#FAFAF7",
                    background: transparent ? "rgba(234,234,223,0.92)" : "#2D2C2C",
                  }}
                >
                  Find Your Protocol
                </span>
              </Link>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-5">
              {/* Account */}
              <Link href="/account">
                <button aria-label="My account" className="hover:opacity-60 transition-opacity">
                  <User size={18} color={iconColor} />
                </button>
              </Link>
              {/* Cart */}
              <Link href="/cart">
                <button aria-label={`Cart (${count} items)`} className="relative hover:opacity-60 transition-opacity">
                  <ShoppingBag size={18} color={iconColor} />
                  {count > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 flex items-center justify-center text-[9px] font-semibold"
                      style={{
                        width: 16,
                        height: 16,
                        background: "#6B7A3E",
                        color: "#FAFAF7",
                        borderRadius: "50%",
                      }}
                    >
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </button>
              </Link>

              {/* Hamburger */}
              <button
                className="md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                {menuOpen
                  ? <X size={22} color={iconColor} />
                  : <Menu size={22} color={iconColor} />
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className="fixed inset-0 z-40 flex flex-col overflow-y-auto"
        style={{
          background: "#2D2C2C",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "opacity 0.28s ease, transform 0.28s ease",
          paddingTop: "88px",
        }}
      >
        <div className="container py-8 flex flex-col gap-5">
          {mobileMainLinks.map(({ label, href }) => (
            <Link key={label} href={href}>
              <span
                className="block font-display text-3xl font-light cursor-pointer transition-opacity hover:opacity-60"
                style={{ color: "#EAEADF" }}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </span>
            </Link>
          ))}

          {/* Support links */}
          <div className="w-12 h-px mt-4" style={{ background: "rgba(234,234,223,0.15)" }} />
          <p className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: "rgba(234,234,223,0.35)" }}>
            Help & Support
          </p>
          {mobileSupportLinks.map(({ label, href }) => (
            <Link key={label} href={href}>
              <span
                className="block text-sm font-medium cursor-pointer hover:opacity-60 transition-opacity"
                style={{ color: "rgba(234,234,223,0.6)" }}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </span>
            </Link>
          ))}

          <div className="w-12 h-px mt-4" style={{ background: "rgba(234,234,223,0.12)" }} />
          <p className="text-xs" style={{ color: "rgba(234,234,223,0.3)" }}>
            Science-Driven Luxury for Timeless Skin.
          </p>
        </div>
      </div>
    </>
  );
}
