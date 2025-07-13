
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { getSubdomainInfo } from "@/utils/subdomain";
import MainAppRoutes from "@/components/MainAppRoutes";
import StorefrontApp from "@/components/StorefrontApp";

const queryClient = new QueryClient();

const App = () => {
  const subdomainInfo = getSubdomainInfo();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            {subdomainInfo.isSubdomain ? (
              // Subdomain routing: show storefront for the subdomain
              <StorefrontApp storeSlug={subdomainInfo.subdomain!} />
            ) : (
              // Main domain routing: show full app
              <MainAppRoutes />
            )}
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
