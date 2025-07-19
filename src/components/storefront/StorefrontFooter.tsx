import { Heart, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StorefrontFooterProps {
  storeName?: string;
}

export default function StorefrontFooter({ storeName = 'Vendora Store' }: StorefrontFooterProps) {
  const handleCreateStore = () => {
    // Track referral interest
    const storeSlug = window.location.pathname.substring(1);
    localStorage.setItem('referral_source', storeSlug);
    
    // Navigate to signup with referral tracking
    window.open('/?ref=' + storeSlug, '_blank');
  };

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>by</span>
            <span className="font-semibold text-foreground">{storeName}</span>
          </div>
          
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 max-w-md mx-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Create Your Own Store</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Build a professional store like this one in minutes. Start selling and growing your business today.
              </p>
              <Button 
                onClick={handleCreateStore}
                className="w-full"
                size="sm"
              >
                Start Free Store
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <span>Powered by </span>
            <a 
              href="https://vendora.business" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Vendora
            </a>
            <span> - Professional stores for African entrepreneurs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}