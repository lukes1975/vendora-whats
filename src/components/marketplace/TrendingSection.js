import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Eye, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrendingSection = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      setLoading(true);
      
      // Get products with trending metrics
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image_url,
          vendor_id,
          views,
          whatsapp_clicks,
          stores (
            name,
            slug,
            is_active
          )
        `)
        .eq('status', 'active')
        .not('stores.is_active', 'eq', false)
        .order('views', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Calculate trending score and format data
      const productsWithScore = data?.map(product => {
        const viewScore = (product.views || 0) * 1;
        const clickScore = (product.whatsapp_clicks || 0) * 3;
        const trending_score = viewScore + clickScore;
        
        return {
          ...product,
          trending_score,
          stores: Array.isArray(product.stores) && product.stores.length > 0 
            ? {
                name: product.stores[0].name,
                slug: product.stores[0].slug
              }
            : null
        };
      }).sort((a, b) => b.trending_score - a.trending_score) || [];

      setTrendingProducts(productsWithScore);
    } catch (error) {
      console.error('Error fetching trending products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Trending Now
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {trendingProducts.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group block"
            >
              <div className="relative">
                {index < 3 && (
                  <Badge 
                    className="absolute top-2 left-2 z-10 bg-orange-500 hover:bg-orange-600"
                  >
                    #{index + 1}
                  </Badge>
                )}
                <div className="aspect-square overflow-hidden rounded-lg mb-2 bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-1 mb-1">{product.name}</h3>
                <p className="text-sm font-bold text-green-600 mb-1">
                  ₦{product.price?.toLocaleString()}
                </p>
                {product.stores && (
                  <p className="text-xs text-gray-500 mb-2">{product.stores.name}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{product.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{product.whatsapp_clicks || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {trendingProducts.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No trending products yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendingSection;