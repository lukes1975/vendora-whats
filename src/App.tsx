
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { getSubdomainInfo } from "@/utils/subdomain";
import MainAppRoutes from "@/components/MainAppRoutes";
import StorefrontApp from "@/components/StorefrontApp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes - longer cache for better performance
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer (renamed from cacheTime in react-query v5)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Prevent unnecessary refetches
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

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
