import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Settings from "@/pages/Settings";
import Analytics from "@/pages/Analytics";
import DashboardStorefront from "@/pages/DashboardStorefront";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/NotFound";
import Storefront from "@/pages/Storefront";

/**
 * Main application routes for www.vendora.business
 */
const MainAppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/products" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Products />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/products/new" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Products />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/analytics" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Analytics />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/storefront" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardStorefront />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/settings" 
          element={
            <ProtectedRoute>
              <ErrorBoundary>
                <Settings />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        {/* Legacy path-based store routing for development */}
        <Route path="/store/:storeId" element={<Storefront />} />
        <Route path="/demo-store" element={<Storefront />} />
        {/* Dynamic store routing - must be last to avoid conflicts */}
        <Route path="/:storeSlug" element={<Storefront />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default MainAppRoutes;