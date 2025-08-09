
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import StoreProfile from "@/components/storefront/StoreProfile";
import ProductGrid from "@/components/storefront/ProductGrid";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";
import StorefrontFAB from "@/components/storefront/StorefrontFAB";
import { CategoryFilter } from "@/components/storefront/CategoryFilter";
import { seedDummyProductsWithImages } from "@/utils/seedImages";
import { useAuth } from "@/contexts/AuthContext";
import DeliveryEstimatorBanner from "@/components/storefront/DeliveryEstimatorBanner";
import SearchCommand from "@/components/storefront/SearchCommand";
import MobileActionBar from "@/components/storefront/MobileActionBar";

interface Store {
  id: string;
  name: string;
  description: string;
  whatsapp_number: string;
  logo_url: string;
  cover_image_url: string;
  slug: string;
  vendor_id: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  status: string;
}

interface StorefrontProps {
  storeSlug?: string;
}

interface StoreSettings {
  base_location_lat: number | null;
  base_location_lng: number | null;
  google_maps_enabled: boolean;
}

// Platform reserved routes that should not be used as store slugs
const RESERVED_ROUTES = [
  'login', 'signup', 'dashboard', 'pricing', 'admin', 'api', 'auth', 
  'www', 'mail', 'ftp', 'blog', 'shop', 'store', 'help', 'support',
  'about', 'contact', 'terms', 'privacy', 'demo-store'
];

const Storefront = ({ storeSlug }: StorefrontProps = {}) => {
  const { storeId, storeSlug: urlStoreSlug } = useParams();
  // Use storeSlug prop if provided, or URL storeSlug param, or fall back to legacy storeId
  const storeIdentifier = storeSlug || urlStoreSlug || storeId;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Check if the current route is a reserved platform route
  const isReservedRoute = storeIdentifier && RESERVED_ROUTES.includes(storeIdentifier.toLowerCase());

  // If it's a reserved route, show 404
  if (isReservedRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">Store not found</p>
          <a href="/" className="text-blue-600 hover:underline">
            Return to Vendora
          </a>
        </div>
      </div>
    );
  }
  
  // Fetch store data by slug or ID
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['store', storeIdentifier],
    queryFn: async () => {
      if (!storeIdentifier) return null;
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', storeIdentifier)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching store:', error);
        throw error;
      }
      
      return data as Store | null;
    },
    enabled: !!storeIdentifier,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["storefront-categories", store?.vendor_id],
    queryFn: async () => {
      if (!store?.vendor_id) return [];
      
      const { data, error } = await supabase
        .from("categories")
        .select(`
          id, 
          name, 
          parent_id,
          products(count)
        `)
        .eq("vendor_id", store.vendor_id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      
      return data.map(cat => ({
        ...cat,
        product_count: cat.products?.[0]?.count || 0
      }));
    },
    enabled: !!store?.vendor_id,
  });

  // Fetch products for this store
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['store-products', store?.id, selectedCategory],
    queryFn: async () => {
      if (!store?.id) return [];
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Add category filter if selected
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      return data as Product[];
    },
    enabled: !!store?.id,
  });

  // Fetch store settings for base location
  const { data: settings } = useQuery({
    queryKey: ['store-settings', store?.id],
    queryFn: async () => {
      if (!store?.id) return null;
      const { data, error } = await supabase
        .from('store_settings')
        .select('base_location_lat, base_location_lng, google_maps_enabled')
        .eq('store_id', store.id)
        .maybeSingle();
      if (error) throw error;
      return data as StoreSettings | null;
    },
    enabled: !!store?.id,
  });

  // Seed dummy products with actual images if none exist
  useEffect(() => {
    const seedDummyProducts = async () => {
      if (!store?.id || !store?.vendor_id || products.length > 0 || productsLoading) return;
      
      try {
        const success = await seedDummyProductsWithImages(store.id, store.vendor_id);
        if (!success) {
          console.error('Failed to seed dummy products with images');
        }
      } catch (error) {
        console.error('Error seeding dummy products:', error);
      }
    };

    seedDummyProducts();
  }, [store, products.length, productsLoading]);

  const shareStore = () => {
    if (navigator.share && store) {
      navigator.share({
        title: store.name,
        text: store.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Storefront Not Found</h1>
          <p className="text-muted-foreground mb-4">The business you're looking for doesn't exist or is not active.</p>
          <Link to="/">
            <Button className="rounded-full">Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { user } = useAuth();
  const isOwner = user && store && user.id === store.vendor_id;

  const vendorLocation = settings?.base_location_lat != null && settings?.base_location_lng != null
    ? { lat: settings.base_location_lat, lng: settings.base_location_lng }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <StorefrontHeader onShare={shareStore} store={store} />
      <StoreProfile store={store} />

      {/* Delivery Estimator */}
      <DeliveryEstimatorBanner vendorLocation={vendorLocation} />

      {/* Products Section */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 pb-8 sm:pb-12">
        <div className="mb-6 sm:mb-8 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 leading-tight">What We Offer</h2>
          <p className="text-muted-foreground text-sm sm:text-base">See what catches your eye, then DM us to buy</p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        )}

        <ProductGrid 
          products={products} 
          store={store} 
          isLoading={productsLoading} 
        />
      </div>

      <StorefrontFooter storeName={store?.name} />
      <StorefrontFAB show={isOwner} />

      {/* Global search (Cmd/Ctrl+K) */}
      <SearchCommand products={products} />
      {/* Mobile sticky cart bar */}
      <MobileActionBar store={store} />
    </div>
  );
};

export default Storefront;
