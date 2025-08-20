import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingPage } from "@/components/ui/loading-spinner";
import Index from "@/pages/Index";

// Lazy load non-critical pages to reduce initial bundle size
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Products = lazy(() => import("@/pages/Products"));
const Settings = lazy(() => import("@/pages/Settings"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const DashboardStorefront = lazy(() => import("@/pages/DashboardStorefront"));
const WhatsApp = lazy(() => import("@/pages/WhatsApp"));
const BikeDelivery = lazy(() => import("@/pages/BikeDelivery"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Storefront = lazy(() => import("@/pages/Storefront"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const Checkout = lazy(() => import("@/pages/Checkout"));

/**
 * Main application routes for www.vendora.business
 */
const MainAppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={
          <Suspense fallback={<LoadingPage />}>
            <Login />
          </Suspense>
        } />
        <Route path="/payment-success" element={
          <Suspense fallback={<LoadingPage />}>
            <PaymentSuccess />
          </Suspense>
        } />
        <Route path="/signup" element={
          <Suspense fallback={<LoadingPage />}>
            <Signup />
          </Suspense>
        } />
        <Route path="/pricing" element={
          <Suspense fallback={<LoadingPage />}>
            <Pricing />
          </Suspense>
        } />
        <Route path="/checkout" element={
          <Suspense fallback={<LoadingPage />}>
            <Checkout />
          </Suspense>
        } />
        <Route path="/bikemendelivery" element={
          <Suspense fallback={<LoadingPage />}>
            <BikeDelivery />
          </Suspense>
        } />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingPage />}>
                  <Dashboard />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/products" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingPage />}>
                  <Products />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/products/new" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingPage />}>
                  <Products />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/analytics" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingPage />}>
                  <Analytics />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/storefront" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingPage />}>
                  <DashboardStorefront />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/whatsapp" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingPage />}>
                  <WhatsApp />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/settings" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Suspense fallback={<LoadingPage />}>
                  <Settings />
                </Suspense>
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        {/* Legacy path-based store routing for development */}
        <Route path="/store/:storeId" element={
          <Suspense fallback={<LoadingPage />}>
            <Storefront />
          </Suspense>
        } />
        <Route path="/demo-store" element={
          <Suspense fallback={<LoadingPage />}>
            <Storefront />
          </Suspense>
        } />
        {/* Dynamic store routing - must be last to avoid conflicts with platform routes */}
        <Route path="/:storeSlug" element={
          <Suspense fallback={<LoadingPage />}>
            <Storefront />
          </Suspense>
        } />
        <Route path="*" element={
          <Suspense fallback={<LoadingPage />}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </ErrorBoundary>
  );
};

export default MainAppRoutes;