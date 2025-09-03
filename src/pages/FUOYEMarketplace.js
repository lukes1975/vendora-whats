import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Search, Filter, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import TrendingSection from '@/components/marketplace/TrendingSection';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import StudentVerificationBanner from '@/components/marketplace/StudentVerificationBanner';
import WishlistButton from '@/components/marketplace/WishlistButton';

const FUOYEMarketplace = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStores: 0,
    totalStudents: 0
  });

  useEffect(() => {
    fetchMarketplaceData();
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Build query
      let query = supabase
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
          store_id,
          marketplace_category_id,
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
            rating
          )
        `)
        .eq('status', 'active')
        .not('stores.is_active', 'eq', false);

      // Apply filters
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory) {
        query = query.eq('marketplace_category_id', selectedCategory);
      }

      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (max) {
          query = query.gte('price', min).lte('price', max);
        } else {
          query = query.gte('price', min);
        }
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'popular':
          query = query.order('views', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      query = query.limit(50);

      const { data, error } = await query;

      if (error) throw error;

      // Format the data to handle the stores array structure
      const formattedProducts = data?.map(product => ({
        ...product,
        stores: Array.isArray(product.stores) && product.stores.length > 0 
          ? product.stores[0] // Take the first store
          : null,
        average_rating: product.product_ratings?.length > 0 
          ? product.product_ratings.reduce((sum, rating) => sum + rating.rating, 0) / product.product_ratings.length 
          : 0
      })) || [];

      setProducts(formattedProducts);

      // Fetch categories for filter
      const { data: categoriesData } = await supabase
        .from('marketplace_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch marketplace stats
      const [
        { count: totalProducts },
        { count: totalStores },
        { count: totalStudents }
      ] = await Promise.all([
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('stores')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_student_verified', true)
      ]);

      setStats({
        totalProducts: totalProducts || 0,
        totalStores: totalStores || 0,
        totalStudents: totalStudents || 0
      });

    } catch (error) {
      console.error('Error fetching marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3 w-3 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Student Verification Banner */}
        <StudentVerificationBanner />
        
        {/* Marketplace Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Stores</p>
                <p className="text-2xl font-bold">{stats.totalStores}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trending Section */}
        <div className="mb-8">
          <TrendingSection />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Find Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Price</SelectItem>
                  <SelectItem value="0-1000">Under ₦1,000</SelectItem>
                  <SelectItem value="1000-5000">₦1,000 - ₦5,000</SelectItem>
                  <SelectItem value="5000-10000">₦5,000 - ₦10,000</SelectItem>
                  <SelectItem value="10000-50000">₦10,000 - ₦50,000</SelectItem>
                  <SelectItem value="50000">Above ₦50,000</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                  <Link to={`/product/${product.id}`}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </Link>
                  
                  {/* Wishlist Button */}
                  <div className="absolute top-2 right-2">
                    <WishlistButton productId={product.id} />
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <Link to={`/product/${product.id}`} className="block">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  {product.stores && (
                    <Link to={`/${product.stores.slug}`} className="block mb-2">
                      <p className="text-xs text-gray-600 hover:text-blue-600 transition-colors">
                        by {product.stores.name}
                      </p>
                    </Link>
                  )}
                  
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(Math.round(product.average_rating))}
                    <span className="text-xs text-gray-600 ml-1">
                      ({product.product_ratings?.length || 0})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-green-600">
                      ₦{product.price?.toLocaleString()}
                    </p>
                    
                    {product.marketplace_categories && (
                      <Badge variant="secondary" className="text-xs">
                        {product.marketplace_categories.name}
                      </Badge>
                    )}
                  </div>
                  
                  <Link to={`/product/${product.id}`}>
                    <Button className="w-full mt-3" size="sm">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FUOYEMarketplace;