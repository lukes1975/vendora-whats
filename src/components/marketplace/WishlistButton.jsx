import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

const WishlistButton = ({ 
  productId, 
  size = 'default',
  className 
}) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const isInWishlistState = isInWishlist(productId);

  return (
    <Button
      variant={isInWishlistState ? "default" : "outline"}
      size={size}
      onClick={handleWishlistToggle}
      className={cn(
        "transition-all duration-200",
        isInWishlistState 
          ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
          : "hover:bg-red-50 hover:border-red-300 hover:text-red-600",
        className
      )}
    >
      <Heart 
        className={cn(
          "h-4 w-4",
          isInWishlistState ? "fill-current" : "",
          size === 'sm' && "h-3 w-3"
        )} 
      />
      {size !== 'sm' && (
        <span className="ml-1">
          {isInWishlistState ? 'Saved' : 'Save'}
        </span>
      )}
    </Button>
  );
};

export default WishlistButton;