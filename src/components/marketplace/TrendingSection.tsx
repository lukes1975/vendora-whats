import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, TrendingUp, Eye, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarketplaceAnalytics } from '@/hooks/useMarketplaceAnalytics';
import { useWishlist } from '@/hooks/useWishlist';
import { WishlistButton } from './WishlistButton';

interface TrendingProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  trending_score: number;
  vendor_id: string;
  stores: {
    name: string;
    slug: string;
  };
}

const TrendingSection = () => {
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { trackProductView, trackWhatsAppClick } = useMarketplaceAnalytics();
  const { isInWishlist } = useWishlist();

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      // Get all active products first
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image_url,
          vendor_id,
          stores!inner (
            name,
            slug,
            is_active
          )
        `)
        .eq('stores.is_active', true)
        .eq('status', 'active')
        .limit(20); // Get more products to calculate trending scores

      if (error) throw error;

      // For each product, calculate trending score
      const productsWithScores = await Promise.all(
        (products || []).map(async (product) => {
          const { data: score } = await supabase
            .rpc('calculate_trending_score', { product_id: product.id });
          
          return {
            ...product,
            trending_score: score || 0
          };
        })
      );

      // Sort by trending score and take top 6
      const sortedProducts = productsWithScores
        .filter(p => p.trending_score > 0) // Only show products with activity
        .sort((a, b) => b.trending_score - a.trending_score)
        .slice(0, 6);

      setTrendingProducts(sortedProducts);
    } catch (error) {
      console.error('Error fetching trending products:', error);
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

  const handleProductView = (product: TrendingProduct) => {
    trackProductView(product.id, product.vendor_id);
  };

  const handleWhatsAppClick = (product: TrendingProduct) => {
    trackWhatsAppClick(product.id, product.vendor_id);
    const message = `Hi! I'm interested in your trending product: ${product.name} (${formatPrice(product.price)}) from FUOYE Marketplace.`;
    const whatsappUrl = `https://wa.me/${product.stores.name}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Trending at FUOYE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-32 rounded-lg mb-2" />
                <div className="bg-muted h-4 rounded mb-1" />
                <div className="bg-muted h-3 rounded w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trendingProducts.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Flame className="h-6 w-6 text-orange-500" />
          Trending at FUOYE
          <Badge variant="secondary" className="ml-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            Hot Right Now
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trendingProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-300 relative overflow-hidden"
            >
              {index < 3 && (
                <Badge 
                  className="absolute top-2 left-2 z-10 bg-orange-500 text-white"
                  variant="default"
                >
                  #{index + 1}
                </Badge>
              )}
              
              <div className="absolute top-2 right-2 z-10">
                <WishlistButton 
                  productId={product.id}
                  vendorId={product.vendor_id}
                  isInWishlist={isInWishlist(product.id)}
                  size="sm"
                />
              </div>

              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
                
                <div className="p-3 space-y-2">
                  <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-orange-600 font-bold text-sm">
                    {formatPrice(product.price)}
                  </p>
                  
                  <div className="flex gap-1">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => handleProductView(product)}
                    >
                      <Link to={`/${product.stores.slug}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhatsAppClick(product)}
                      className="h-7 px-2"
                    >
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingSection;