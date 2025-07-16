
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
  Store,
  FolderOpen
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
    { icon: Home, label: 'Business Hub', path: '/dashboard' },
    { icon: Package, label: 'Your Storefront Items', path: '/dashboard/products' },
    { icon: Store, label: 'View Your Storefront', path: '/dashboard/storefront' },
    { icon: BarChart3, label: 'Views & WhatsApp Clicks', path: '/dashboard/analytics' },
    { icon: Settings, label: 'Customize Your Brand', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-lg bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/dashboard" className="flex items-center group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent px-3 py-1">
                    Vendora
                  </span>
                </div>
              </Link>
            </div>

            {/* User actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <UpgradePlanButton />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                    {user?.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-9 w-9 p-0 sm:h-9 sm:w-auto sm:px-3 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Mobile upgrade */}
          <div className="sm:hidden pb-3">
            <UpgradePlanButton />
          </div>
        </div>
      </header>

      {/* Premium Navigation */}
      <nav className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all hover:bg-accent/50 ${
                    isActive
                      ? 'text-primary border-primary bg-primary/5'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.label.split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
