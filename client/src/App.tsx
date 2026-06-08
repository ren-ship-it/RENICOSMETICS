import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import PageTransition from "./components/PageTransition";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import CookieConsent from "./components/CookieConsent";
import Home from "./pages/Home";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import SystemPage from "./pages/SystemPage";
import SciencePage from "./pages/SciencePage";
import JournalPage from "./pages/JournalPage";
import JournalArticlePage from "./pages/JournalArticlePage";
import CartPage from "./pages/CartPage";
import BundlePage from "./pages/BundlePage";
import QuizPage from "./pages/QuizPage";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import ShippingPage from "./pages/ShippingPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import StockistsPage from "./pages/StockistsPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import LayeringGuidePage from "./pages/LayeringGuidePage";
import ReferralPage from "./pages/ReferralPage";
import AccountPage from "./pages/AccountPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { lazy, Suspense } from "react";
import { useAuth } from "./_core/hooks/useAuth";
import { useLocation } from "wouter";
import ChatWidget from "./components/ChatWidget";

// Admin pages — lazy loaded so they don't bloat the storefront bundle
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminIntelligence = lazy(() => import("./pages/admin/AdminIntelligence"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminDiscounts = lazy(() => import("./pages/admin/AdminDiscounts"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminSubscribers = lazy(() => import("./pages/admin/AdminSubscribers"));
const AdminChatLogs = lazy(() => import("./pages/admin/AdminChatLogs"));
const AdminStressTest = lazy(() => import("./pages/admin/AdminStressTest"));

// Hide chat widget on admin routes
function ChatWidgetWrapper() {
  const [location] = useLocation();
  if (location.startsWith("/admin")) return null;
  return <ChatWidget />;
}

function AdminGuard({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  if (loading) return <div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || user.role !== "admin") { navigate("/admin/login"); return null; }
  return <Component />;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <PageTransition>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shop" component={ShopPage} />
        <Route path="/products/:slug" component={ProductPage} />
        <Route path="/system" component={SystemPage} />
        <Route path="/science" component={SciencePage} />
        <Route path="/journal" component={JournalPage} />
        <Route path="/journal/:slug" component={JournalArticlePage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/bundle" component={BundlePage} />
        <Route path="/quiz" component={QuizPage} />
        <Route path="/about" component={AboutPage} />
        {/* Support pages */}
        <Route path="/help" component={HelpPage} />
        <Route path="/shipping" component={ShippingPage} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/stockists" component={StockistsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/terms-of-use" component={TermsOfUsePage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/order-confirmation" component={OrderConfirmationPage} />
        <Route path="/layering-guide" component={LayeringGuidePage} />
        <Route path="/referral" component={ReferralPage} />
        <Route path="/account" component={AccountPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        {/* Admin login — brand-owned, not behind the guard */}
        <Route path="/admin/login">
          <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f]" />}>
            <AdminLogin />
          </Suspense>
        </Route>
        {/* Admin routes — protected, lazy-loaded */}
        <Route path="/admin">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminOverview} />
          </Suspense>
        </Route>
        <Route path="/admin/products">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminProducts} />
          </Suspense>
        </Route>
        <Route path="/admin/orders">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminOrders} />
          </Suspense>
        </Route>
        <Route path="/admin/customers">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminCustomers} />
          </Suspense>
        </Route>
        <Route path="/admin/analytics">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminAnalytics} />
          </Suspense>
        </Route>
        <Route path="/admin/intelligence">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminIntelligence} />
          </Suspense>
        </Route>
        <Route path="/admin/content">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminContent} />
          </Suspense>
        </Route>
        <Route path="/admin/discounts">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminDiscounts} />
          </Suspense>
        </Route>
        <Route path="/admin/security">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminSecurity} />
          </Suspense>
        </Route>
        <Route path="/admin/messages">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminMessages} />
          </Suspense>
        </Route>
        <Route path="/admin/subscribers">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminSubscribers} />
          </Suspense>
        </Route>
        <Route path="/admin/chat-logs">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminChatLogs} />
          </Suspense>
        </Route>
        <Route path="/admin/stress-test">
          <Suspense fallback={<div className="min-h-screen bg-[#111] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminGuard component={AdminStressTest} />
          </Suspense>
        </Route>
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <a href="#main-content" className="skip-link">Skip to content</a>
            <div id="main-content" tabIndex={-1}>
              <Router />
            </div>
            <CookieConsent />
            <ChatWidgetWrapper />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
