import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  vendorId: string;
  isInWishlist: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const WishlistButton = ({ 
  productId, 
  vendorId, 
  isInWishlist, 
  size = 'default',
  className 
}: WishlistButtonProps) => {
  const { addToWishlist, removeFromWishlist } = useWishlist();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId, vendorId);
    }
  };

  return (
    <Button
      variant={isInWishlist ? "default" : "outline"}
      size={size}
      onClick={handleWishlistToggle}
      className={cn(
        "transition-all duration-200",
        isInWishlist 
          ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
          : "hover:bg-red-50 hover:border-red-300 hover:text-red-600",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4",
          isInWishlist ? "fill-current" : "",
          size === 'sm' && "h-3 w-3"
        )} 
      />
      {size !== 'sm' && (
        <span className="ml-1">
          {isInWishlist ? 'Saved' : 'Save'}
        </span>
      )}
    </Button>
  );
};