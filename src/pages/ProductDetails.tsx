import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Eye, 
  MessageCircle, 
  Share2,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceAnalytics } from '@/hooks/useMarketplaceAnalytics';
import { useWishlist } from '@/hooks/useWishlist';
import { useVendorFollow } from '@/hooks/useVendorFollow';
import { WishlistButton } from '@/components/marketplace/WishlistButton';
import { ProductInquiries } from '@/components/marketplace/ProductInquiries';
import { EnhancedProductReviews } from '@/components/marketplace/EnhancedProductReviews';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  status: string;
  created_at: string;
  vendor_id: string;
  views: number;
  whatsapp_clicks: number;
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

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { trackProductView, trackWhatsAppClick } = useMarketplaceAnalytics();
  const { isInWishlist } = useWishlist();
  const { isFollowing } = useVendorFollow();

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    if (!productId) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          status,
          created_at,
          vendor_id,
          views,
          whatsapp_clicks,
          stores!inner (
            id,
            name,
            logo_url,
            slug,
            vendor_id,
            is_active
          ),
          marketplace_categories (
            id,
            name,
            icon
          ),
          product_ratings (
            rating
          )
        `)
        .eq('id', productId)
        .eq('stores.is_active', true)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setProduct(data);
      
      // Track product view
      if (data) {
        trackProductView(data.id, data.vendor_id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleWhatsAppInquiry = () => {
    if (!product) return;
    
    trackWhatsAppClick(product.id, product.vendor_id);
    const message = `Hi! I'm interested in your product: ${product.name} (${formatPrice(product.price)}) from FUOYE Marketplace. Can you provide more details?`;
    const whatsappUrl = `https://wa.me/${product.stores.name}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp opened",
      description: "You can now chat with the vendor",
    });
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: `${product.name} - FUOYE Marketplace`,
      text: `Check out this product: ${product.name} for ${formatPrice(product.price)}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Product Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/fuoye-market">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const averageRating = calculateAverageRating(product.product_ratings);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/fuoye-market">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </Card>
            
            {/* Product Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {product.views} views
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {product.whatsapp_clicks} inquiries
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {product.marketplace_categories && (
                <Badge variant="secondary" className="mb-3">
                  {product.marketplace_categories.name}
                </Badge>
              )}
              
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </div>
                
                {averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({product.product_ratings.length} review{product.product_ratings.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description available"}
              </p>
            </div>

            {/* Vendor Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={product.stores.logo_url} />
                    <AvatarFallback>
                      {product.stores.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.stores.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      FUOYE Campus Vendor
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant={isFollowing(product.vendor_id) ? "default" : "outline"}
                      size="sm"
                    >
                      {isFollowing(product.vendor_id) ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/${product.stores.slug}`}>
                        Visit Store
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleWhatsAppInquiry}
                className="flex-1"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contact Vendor
              </Button>
              
              <WishlistButton
                productId={product.id}
                vendorId={product.vendor_id}
                isInWishlist={isInWishlist(product.id)}
                size="lg"
              />
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Product Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold">Product Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Listed:</span>
                    <span className="ml-2">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="ml-2">
                      {product.marketplace_categories?.name || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews and Q&A */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EnhancedProductReviews 
            productId={product.id} 
            productName={product.name}
          />
          <ProductInquiries 
            productId={product.id}
            vendorId={product.vendor_id}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;