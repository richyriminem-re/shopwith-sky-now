import { AdvancedPWAProvider } from "@/components/AdvancedPWAProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useCacheOptimization } from "./hooks/useCacheOptimization";
import CacheStatus from "./components/CacheStatus";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { ThemeProvider } from "next-themes";
import ErrorBoundaryWithRouter from "./components/ErrorBoundaryWithRouter";
import GlobalNavigationTracker from "./components/GlobalNavigationTracker";
import NavigationIntentTracker from "./components/NavigationIntentTracker";
import { initDevVerification } from "./utils/devVerification";
import Layout from "./components/Layout";
import { useState, useEffect } from "react";
import { getFreeShippingThreshold, getShippingMethods } from "./lib/shipping";
import { getPromoCodes } from "./utils/promo";
import { createLazyRoute } from "./components/LazyRoute";
import { NavigationDebugPanel } from "./components/debug/NavigationDebugPanel";
import { PerformanceMetricsDashboard } from "./components/debug/PerformanceMetricsDashboard";
import NavigationDashboard from "./components/NavigationDashboard";
import React from "react";
// Lazy load all route components for better performance
const Home = createLazyRoute(() => import("./pages/Home"), { 
  showProgress: true 
});
const Products = createLazyRoute(() => import("./pages/Products"));
const ProductDetail = createLazyRoute(() => import("./pages/ProductDetail"));
const Cart = createLazyRoute(() => import("./pages/Cart"));
const Checkout = createLazyRoute(() => import("./pages/Checkout"));
const CheckoutEnhanced = createLazyRoute(() => import("./pages/CheckoutEnhanced"));
const CheckoutHybrid = createLazyRoute(() => import("./pages/CheckoutHybrid"));
const Account = createLazyRoute(() => import("./pages/Account"));
const Login = createLazyRoute(() => import("./pages/Login"));
const OrderConfirmation = createLazyRoute(() => import("./pages/OrderConfirmation"));
const OrderPreview = createLazyRoute(() => import("./pages/OrderPreview"));
const Wishlist = createLazyRoute(() => import("./pages/Wishlist"));
const Orders = createLazyRoute(() => import("./pages/Orders"));
const Help = createLazyRoute(() => import("./pages/Help"));
const Contact = createLazyRoute(() => import("./pages/Contact"));
const Notifications = createLazyRoute(() => import("./pages/Notifications"));
const Privacy = createLazyRoute(() => import("./pages/Privacy"));
const Terms = createLazyRoute(() => import("./pages/Terms"));
const ForgotPassword = createLazyRoute(() => import("./pages/ForgotPassword"));
const NotFound = createLazyRoute(() => import("./pages/NotFound"));
const Offline = createLazyRoute(() => import("./pages/Offline"));

// Admin routes
const AdminLayout = createLazyRoute(() => import("./components/admin/AdminLayout"));
const AdminLogin = createLazyRoute(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = createLazyRoute(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = createLazyRoute(() => import("./pages/admin/AdminProducts"));
const AdminHeroSlides = createLazyRoute(() => import("./pages/admin/AdminHeroSlides"));
const AdminShippingPromos = createLazyRoute(() => import("./pages/admin/AdminShippingPromos"));
const AdminSiteSettings = createLazyRoute(() => import("./pages/admin/AdminSiteSettings"));





const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
  },
});

// App content component with cache optimization
const AppContent = () => {
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  
  // Initialize shipping and promo settings on app load
  useEffect(() => {
    getFreeShippingThreshold().catch(console.error);
    getShippingMethods().catch(console.error);
    getPromoCodes().catch(console.error);
  }, []);
  
  useCacheOptimization({
    prefetchProducts: true,
    prefetchCategories: true,
    backgroundRefetch: true,
    persistCache: true,
  });

  // Log navigation errors
  console.log('Router initializing with routes');
  
  // Debug panels state
  const [showNavigationDebug, setShowNavigationDebug] = useState(false);
  const [showMetricsDashboard, setShowMetricsDashboard] = useState(false);

  // Show debug panels in development with keyboard shortcuts + global Alt+Left navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Development debug shortcuts
      if (import.meta.env.DEV) {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
          setShowPerformanceMonitor(prev => !prev);
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'N') {
          setShowNavigationDebug(prev => !prev);
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'M') {
          setShowMetricsDashboard(prev => !prev);
        }
      }
      
      // Global Alt+Left navigation shortcut for accessibility
      if (e.altKey && e.key === 'ArrowLeft') {
        const activeElement = document.activeElement as HTMLElement;
        
        // Safeguards: Don't interfere with forms, inputs, or modals
        const isInForm = activeElement?.closest('form') !== null;
        const isInputElement = ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].includes(activeElement?.tagName || '');
        const isInModal = activeElement?.closest('[role="dialog"]') !== null;
        const isContentEditable = activeElement?.contentEditable === 'true';
        
        // Only trigger if we're in safe navigation context
        if (!isInForm && !isInputElement && !isInModal && !isContentEditable) {
          e.preventDefault();
          
          // Find the first back button on the page and trigger it
          const backButton = document.querySelector('[aria-label*="Go back"], [aria-label*="back"]') as HTMLButtonElement;
          if (backButton && !backButton.disabled) {
            backButton.click();
          } else {
            // Fallback: trigger browser back if no back button found
            try {
              window.history.back();
            } catch (error) {
              console.warn('Global back navigation failed:', error);
            }
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Initialize dev verification
    initDevVerification();
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <ErrorBoundaryWithRouter>
      <GlobalNavigationTracker />
      <NavigationIntentTracker />
      <Routes>
        {/* Main App Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="product" element={<Products />} />
          <Route path="product/:handle" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout-enhanced" element={<CheckoutEnhanced />} />
          <Route path="checkout-hybrid" element={<CheckoutHybrid />} />
          <Route path="form-demo" element={<Navigate to="/" replace />} />
          <Route path="account" element={<Account />} />
          <Route path="login" element={<Login />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="orders" element={<Orders />} />
          <Route path="faq" element={<Help />} />
          <Route path="contact" element={<Contact />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          {/* Redirects for common links */}
          <Route path="deals" element={<Navigate to="/product?category=deals" replace />} />
          <Route path="new-arrivals" element={<Navigate to="/product?sort=newest" replace />} />
          <Route path="help" element={<Navigate to="/faq" replace />} />
        </Route>
        
        
        {/* Routes without layout */}
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/order-preview" element={<OrderPreview />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/offline" element={<Offline />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="hero-slides" element={<AdminHeroSlides />} />
              <Route path="shipping-promos" element={<AdminShippingPromos />} />
              <Route path="site-settings" element={<AdminSiteSettings />} />
            </Route>
        

        {/* Developer Dashboard (Development Only) */}
        {import.meta.env.DEV && (
          <Route path="/__nav" element={<NavigationDashboard />} />
        )}
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PerformanceMonitor 
        isVisible={showPerformanceMonitor}
        onToggle={() => setShowPerformanceMonitor(false)}
      />
      
      {/* Debug Panels (Development Only) */}
      {import.meta.env.DEV && (
        <>
          <NavigationDebugPanel 
            isVisible={showNavigationDebug}
            onClose={() => setShowNavigationDebug(false)}
          />
          <PerformanceMetricsDashboard 
            isVisible={showMetricsDashboard}
            onClose={() => setShowMetricsDashboard(false)}
          />
        </>
      )}
    </ErrorBoundaryWithRouter>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AdvancedPWAProvider 
              enableAll={true}
              enablePerformanceDashboard={import.meta.env.DEV}
            >
              <Toaster />
              <Sonner />
              <AppContent />
              <CacheStatus />
            </AdvancedPWAProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
