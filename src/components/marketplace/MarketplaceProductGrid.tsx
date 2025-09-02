import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ShoppingCart, MessageCircle, MapPin, Eye, UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMarketplaceAnalytics } from "@/hooks/useMarketplaceAnalytics";
import { useWishlist } from "@/hooks/useWishlist";
import { useVendorFollow } from "@/hooks/useVendorFollow";
import { WishlistButton } from "./WishlistButton";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  status: string;
  created_at: string;
  vendor_id: string;
  store_id: string;
  stores: {
    id: string;
    name: string;
    logo_url: string;
    slug: string;
    vendor_id: string;
  };
  marketplace_categories: {
    id: string;
    name: string;
    icon: string;
  } | null;
  product_ratings: {
    rating: number;
  }[];
}

interface MarketplaceProductGridProps {
  products: Product[];
  loading: boolean;
}

const MarketplaceProductGrid = ({ products, loading }: MarketplaceProductGridProps) => {
  const [viewedProducts, setViewedProducts] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { trackProductView, trackWhatsAppClick } = useMarketplaceAnalytics();
  const { isInWishlist } = useWishlist();
  const { isFollowing, followVendor, unfollowVendor } = useVendorFollow();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateAverageRating = (ratings: { rating: number }[]) => {
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  };

  const handleViewProduct = (productId: string, vendorId: string) => {
    setViewedProducts(prev => new Set([...prev, productId]));
    trackProductView(productId, vendorId);
  };

  const handleWhatsAppInquiry = (product: Product) => {
    trackWhatsAppClick(product.id, product.vendor_id);
    const message = `Hi! I'm interested in your product: ${product.name} (${formatPrice(product.price)}) from FUOYE Marketplace. Can you provide more details?`;
    const whatsappUrl = `https://wa.me/${product.stores.name}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp opened",
      description: "You can now chat with the vendor",
    });
  };

  const handleFollowVendor = async (vendorId: string) => {
    const isCurrentlyFollowing = isFollowing(vendorId);
    if (isCurrentlyFollowing) {
      await unfollowVendor(vendorId);
    } else {
      await followVendor(vendorId);
    }
  };

  if (products.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No products found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </div>
        <Button asChild>
          <Link to="/signup">
            Become a Vendor
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {products.length} Product{products.length !== 1 ? 's' : ''} Available
        </h2>
        <Badge variant="outline" className="px-3 py-1">
          <MapPin className="h-3 w-3 mr-1" />
          FUOYE Campus
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const productRating = calculateAverageRating(product.product_ratings);
          const isViewed = viewedProducts.has(product.id);

          return (
            <Card 
              key={product.id} 
              className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
            >
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  {product.marketplace_categories && (
                    <Badge className="absolute top-2 left-2 bg-background/90 text-foreground">
                      {product.marketplace_categories.name}
                    </Badge>
                  )}
                  {!isViewed && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      New
                    </Badge>
                  )}
                  
                  {/* Wishlist Button */}
                  <div className="absolute bottom-2 right-2">
                    <WishlistButton 
                      productId={product.id}
                      vendorId={product.vendor_id}
                      isInWishlist={isInWishlist(product.id)}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {/* Product Title & Price */}
                  <div>
                    <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  {/* Product Description */}
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {product.description || "No description available"}
                  </p>

                  {/* Ratings */}
                  <div className="flex items-center gap-4 text-sm">
                    {productRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{productRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">
                          ({product.product_ratings.length})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Vendor Info */}
                  <div className="flex items-center gap-3 py-2 border-t">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={product.stores.logo_url} />
                      <AvatarFallback className="text-xs">
                        {product.stores.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {product.stores.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        FUOYE Vendor
                      </p>
                    </div>
                    <Button
                      variant={isFollowing(product.vendor_id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFollowVendor(product.vendor_id)}
                      className="text-xs px-2 h-7"
                    >
                      {isFollowing(product.vendor_id) ? (
                        <>
                          <UserCheck className="h-3 w-3 mr-1" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      asChild
                      className="flex-1"
                      onClick={() => handleViewProduct(product.id, product.vendor_id)}
                    >
                      <Link to={`/product/${product.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Product
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhatsAppInquiry(product)}
                      className="px-3"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MarketplaceProductGrid;