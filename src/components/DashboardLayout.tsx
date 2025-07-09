
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Home, 
  Package, 
  Store, 
  Settings, 
  LogOut, 
  User,
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Products', href: '/dashboard/products', icon: Package },
    { name: 'Storefront', href: '/dashboard/storefront', icon: Store },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const NavigationItems = ({ onItemClick = () => {} }) => (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  const UserMenu = ({ onSignOut = handleSignOut }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start p-2">
          <User className="mr-2 h-4 w-4" />
          <span className="truncate text-sm">{user?.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm border-b px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Drawer open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="text-left">
                    <div className="flex items-center justify-between">
                      <DrawerTitle className="text-xl font-bold text-blue-600">
                        Vendora
                      </DrawerTitle>
                      <DrawerClose asChild>
                        <Button variant="ghost" size="sm" className="p-2">
                          <X className="h-4 w-4" />
                        </Button>
                      </DrawerClose>
                    </div>
                  </DrawerHeader>
                  <div className="px-4 pb-6 space-y-4">
                    <NavigationItems onItemClick={() => setSidebarOpen(false)} />
                    <div className="pt-4 border-t">
                      <UserMenu />
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
              <h1 className="text-lg font-bold text-blue-600">Vendora</h1>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* Mobile Content */}
        <main className="p-4 min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">Vendora</h1>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">
            <NavigationItems />
          </div>

          {/* User menu */}
          <div className="p-4 border-t">
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="pl-64">
        <main className="p-6 lg:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
