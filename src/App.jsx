import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import AddProduct from "@/pages/AddProduct";
import EditProduct from "@/pages/EditProduct"; // 👈 import it
import PrivateRoute from '@/components/PrivateRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute requiredRole="seller">
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/add-product"
                element={
                  <PrivateRoute requiredRole="seller">
                    <AddProduct />
                  </PrivateRoute>
                }
              />

              <Route
                path="/edit-product/:id"   // 👈 new edit route
                element={
                  <PrivateRoute requiredRole="seller">
                    <EditProduct />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
