
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 overflow-x-hidden">
      <div className="flex items-center justify-between max-w-7xl mx-auto min-w-0">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <img 
            src="/lovable-uploads/7ea27942-32b4-47b5-8d40-55f11cd46372.png" 
            alt="Vendora" 
            className="h-6 sm:h-8 w-auto flex-shrink-0"
          />
        </div>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-sm sm:text-base max-w-32 sm:max-w-none">{user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
