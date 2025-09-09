import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  ArrowLeft, 
  Eye, 
  MessageCircle, 
  ShoppingCart,
  Share2,
  Heart,
  Store,
  MapPin,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import WishlistButton from '@/components/marketplace/WishlistButton';
import EnhancedProductReviews from '@/components/marketplace/EnhancedProductReviews';

const ProductDetails = () => {
  const { productId } = useParams();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      incrementViews();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      
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
          stores (
            id,
            name,
            logo_url,
            slug,
            vendor_id,
            is_active
          ),
          marketplace_categories (
            id,
            name
          ),
          product_ratings (
            id,
            rating,
            review,
            reviewer_name,
            created_at
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;

      // Format the product data to handle the stores array structure
      const formattedProduct = {
        ...data,
        stores: Array.isArray(data.stores) && data.stores.length > 0 
          ? data.stores[0] // Take the first store
          : null,
        average_rating: data.product_ratings?.length > 0 
          ? data.product_ratings.reduce((sum, rating) => sum + rating.rating, 0) / data.product_ratings.length 
          : 0
      };

      setProduct(formattedProduct);

      // Fetch related products from same category or vendor
      if (data.marketplace_categories?.id || data.vendor_id) {
        const { data: related } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            image_url,
            stores (name, slug)
          `)
          .neq('id', productId)
          .eq('status', 'active')
          .or(`marketplace_category_id.eq.${data.marketplace_categories?.id},vendor_id.eq.${data.vendor_id}`)
          .limit(4);

        if (related) {
          setRelatedProducts(related);
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment_product_views', { product_id: productId });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleWhatsAppClick = async () => {
    if (!product || !product.stores) return;

    try {
      // Increment WhatsApp clicks
      await supabase.rpc('increment_whatsapp_clicks', { product_id: productId });
      
      // Generate WhatsApp link
      const whatsappLink = generateWhatsAppLink(
        product.stores.whatsapp_number || '+2348000000000', // fallback number
        product.name,
        product.stores.name
      );
      
      window.open(whatsappLink, '_blank');
      
      toast({
        title: 'Opening WhatsApp',
        description: 'Redirecting you to chat with the seller',
      });
    } catch (error) {
      console.error('Error handling WhatsApp click:', error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on FUOYE Marketplace`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied',
          description: 'Product link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Share failed',
        description: 'Could not share this product',
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/fuoye-market">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl p-4">
        {/* Back Button */}
        <Link to="/fuoye-market">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 border">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex gap-2">
                  <WishlistButton productId={product.id} />
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {renderStars(Math.round(product.average_rating))}
                <span className="text-sm text-gray-600">
                  ({product.product_ratings?.length || 0} reviews)
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{product.views || 0} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{product.whatsapp_clicks || 0} inquiries</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-green-600 mb-4">
                ₦{product.price?.toLocaleString()}
              </div>

              {product.marketplace_categories && (
                <Badge className="mb-4">{product.marketplace_categories.name}</Badge>
              )}
            </div>

            {/* Store Info */}
            {product.stores && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Sold by
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarImage src={product.stores?.logo_url || ''} />
                      <AvatarFallback>
                        {product.stores?.name?.charAt(0).toUpperCase() || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link 
                        to={`/${product.stores?.slug || ''}`}
                        className="font-semibold hover:text-blue-600 transition-colors"
                      >
                        {product.stores?.name || 'Unknown Store'}
                      </Link>
                      <p className="text-sm text-gray-600">Verified Seller</p>
                    </div>
                  </div>
                  <Link to={`/${product.stores.slug}`}>
                    <Button variant="outline" className="w-full mb-2">
                      Visit Store
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleWhatsAppClick}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Chat with Seller
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                size="lg"
                onClick={() => {
                  toast({
                    title: 'Feature Coming Soon',
                    description: 'Direct cart functionality will be available soon',
                  });
                }}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart (Coming Soon)
              </Button>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <div className="mb-8">
          <EnhancedProductReviews productId={product.id} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Related Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((related) => (
                  <Link key={related.id} to={`/product/${related.id}`} className="group">
                    <div className="aspect-square overflow-hidden rounded-lg mb-2 bg-gray-100">
                      {related.image_url ? (
                        <img
                          src={related.image_url}
                          alt={related.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{related.name}</h3>
                    <p className="text-sm font-bold text-green-600">₦{related.price?.toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;