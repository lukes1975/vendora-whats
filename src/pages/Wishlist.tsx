import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, ShoppingCart, MessageCircle, Eye, Trash2, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  const handleWhatsAppInquiry = (item: any) => {
    const message = `Hi! I'm interested in your product: ${item.products.name} (${formatPrice(item.products.price)}) from my FUOYE Marketplace wishlist.`;
    const whatsappUrl = `https://wa.me/${item.products.stores.name}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp opened",
      description: "You can now chat with the vendor",
    });
  };

  const handleShare = async (item: any) => {
    const shareData = {
      title: `${item.products.name} - FUOYE Marketplace`,
      text: `Check out this product: ${item.products.name} for ${formatPrice(item.products.price)}`,
      url: `${window.location.origin}/${item.products.stores.slug}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Login to View Wishlist
            </h2>
            <p className="text-muted-foreground mb-6">
              Please login to access your saved products
            </p>
            <Button asChild>
              <Link to="/login">
                Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-current" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-2">
              {wishlistItems.length} saved product{wishlistItems.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-2">
            FUOYE Marketplace
          </Badge>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-6">
              <Heart className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-muted-foreground">
                Save products you're interested in to view them here
              </p>
            </div>
            <Button asChild>
              <Link to="/fuoye-market">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card 
                key={item.id} 
                className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={item.products.image_url || "/placeholder.svg"}
                      alt={item.products.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    
                    {/* Remove from wishlist button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => handleRemoveFromWishlist(item.product_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Product Title & Price */}
                    <div>
                      <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {item.products.name}
                      </h3>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(item.products.price)}
                      </p>
                    </div>

                    {/* Vendor Info */}
                    <div className="flex items-center gap-3 py-2 border-t">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {item.products.stores?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.products.stores?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          FUOYE Vendor
                        </p>
                      </div>
                    </div>

                    {/* Wishlist Date */}
                    <div className="text-xs text-muted-foreground">
                      Saved on {new Date(item.created_at).toLocaleDateString()}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        asChild
                        className="flex-1"
                      >
                        <Link to={`/${item.products.stores?.slug}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Store
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWhatsAppInquiry(item)}
                        className="px-3"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(item)}
                        className="px-3"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {wishlistItems.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button asChild variant="outline">
                  <Link to="/fuoye-market">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const shareText = `Check out my FUOYE Marketplace wishlist with ${wishlistItems.length} amazing products!`;
                    navigator.clipboard.writeText(shareText);
                    toast({
                      title: "Wishlist Shared",
                      description: "Wishlist details copied to clipboard",
                    });
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Wishlist
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Wishlist;