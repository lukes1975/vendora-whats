
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Settings, 
  LogOut, 
  Home,
  BarChart3,
  Store,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UpgradePlanButton from './dashboard/UpgradePlanButton';

const DashboardLayout = ({ children }: { children?: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll behavior for mobile navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setMobileNavVisible(false);
      } else {
        setMobileNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
    { icon: Home, label: 'Dashboard', shortLabel: 'Home', path: '/dashboard' },
    { icon: Package, label: 'Products', shortLabel: 'Products', path: '/dashboard/products' },
    { icon: Store, label: 'Storefront', shortLabel: 'Store', path: '/dashboard/storefront' },
    { icon: MessageSquare, label: 'WhatsApp', shortLabel: 'Chat', path: '/dashboard/whatsapp' },
    { icon: BarChart3, label: 'Analytics', shortLabel: 'Stats', path: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', shortLabel: 'Settings', path: '/dashboard/settings' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <Link to="/dashboard" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent px-3 py-1">
                  Vendora
                </span>
              </div>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(item.path);
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon className={`h-6 w-6 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              
              {/* Bottom section */}
              <li className="mt-auto">
                <div className="space-y-4">
                  <UpgradePlanButton />
                  
                  {/* User info */}
                  <div className="flex items-center gap-2 px-2 py-2 bg-muted rounded-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground truncate">
                      {user?.email}
                    </span>
                  </div>
                  
                  {/* Sign out */}
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start gap-x-3 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card/80 backdrop-blur-lg px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-muted-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent px-2 py-1">
                    Vendora
                  </span>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
              <UpgradePlanButton />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-muted-foreground" />
                </button>
              </div>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card px-6 pb-4 ring-1 ring-border">
                <div className="flex h-16 shrink-0 items-center">
                  <Link to="/dashboard" className="flex items-center group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent px-3 py-1">
                        Vendora
                      </span>
                    </div>
                  </Link>
                </div>
                
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = isActivePath(item.path);
                          return (
                            <li key={item.path}>
                              <Link
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-all duration-200 ${
                                  isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                              >
                                <Icon className={`h-6 w-6 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ${
        mobileNavVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-card/95 backdrop-blur-lg border-t border-border">
          <div className="grid grid-cols-5 h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {item.shortLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-8 pb-20 lg:pb-8">
          <div className="animate-fade-in">
            {children || <Outlet />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
