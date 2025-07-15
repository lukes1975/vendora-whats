import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
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
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/products" 
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/products/new" 
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/analytics" 
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/storefront" 
        element={
          <ProtectedRoute>
            <DashboardStorefront />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/settings" 
        element={
          <ProtectedRoute>
            <Settings />
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
  );
};

export default MainAppRoutes;