
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Settings, 
  LogOut, 
  Home,
  BarChart3,
  Store
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UpgradePlanButton from './dashboard/UpgradePlanButton';

const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Products', path: '/dashboard/products' },
    { icon: Store, label: 'My Store', path: '/dashboard/storefront' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/dashboard" className="flex items-center">
                <span className="text-xl font-bold text-blue-600">Vendora</span>
              </Link>
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Upgrade button - hidden on very small screens */}
              <div className="hidden xs:block">
                <UpgradePlanButton />
              </div>
              
              {/* User email/name - responsive sizing */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-gray-700 truncate max-w-[120px] sm:max-w-[200px]">
                  {user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex-shrink-0 h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Mobile upgrade button row */}
          <div className="xs:hidden pb-3">
            <UpgradePlanButton />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 whitespace-nowrap border-b-2 border-transparent hover:border-blue-600"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default DashboardLayout;
