
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import StoreProfile from "@/components/storefront/StoreProfile";
import ProductGrid from "@/components/storefront/ProductGrid";
import StorefrontFooter from "@/components/storefront/StorefrontFooter";

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

const Storefront = () => {
  const { storeId } = useParams();
  
  // Fetch store data by slug
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      if (!storeId) return null;
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', storeId)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching store:', error);
        throw error;
      }
      
      return data as Store | null;
    },
    enabled: !!storeId,
  });

  // Fetch products for this store
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['store-products', store?.id],
    queryFn: async () => {
      if (!store?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      return data as Product[];
    },
    enabled: !!store?.id,
  });

  // Seed dummy products if none exist
  useEffect(() => {
    const seedDummyProducts = async () => {
      if (!store?.id || !store?.vendor_id || products.length > 0 || productsLoading) return;
      
      const dummyProducts = [
        {
          name: "African Ankara Fabric",
          price: 7500,
          description: "Beautifully patterned Ankara fabric for special occasions.",
          image_url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop",
          store_id: store.id,
          vendor_id: store.vendor_id,
          status: 'active'
        },
        {
          name: "Handcrafted Wooden Bowl",
          price: 4500,
          description: "Beautiful handcrafted wooden bowl perfect for home decor.",
          image_url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&h=300&fit=crop",
          store_id: store.id,
          vendor_id: store.vendor_id,
          status: 'active'
        },
        {
          name: "Traditional Jewelry Set",
          price: 12000,
          description: "Elegant traditional jewelry set with intricate designs.",
          image_url: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=300&fit=crop",
          store_id: store.id,
          vendor_id: store.vendor_id,
          status: 'active'
        },
        {
          name: "Artisan Pottery Vase",
          price: 6800,
          description: "Unique artisan pottery vase crafted with care.",
          image_url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300&h=300&fit=crop",
          store_id: store.id,
          vendor_id: store.vendor_id,
          status: 'active'
        }
      ];

      try {
        const { error } = await supabase
          .from('products')
          .insert(dummyProducts);
        
        if (error) {
          console.error('Error seeding dummy products:', error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
          <p className="text-gray-600 mb-4">The store you're looking for doesn't exist or is not active.</p>
          <Link to="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StorefrontHeader onShare={shareStore} />
      <StoreProfile store={store} />
      
      {/* Products Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Products</h2>
          <p className="text-gray-600">Discover our carefully curated collection</p>
        </div>

        <ProductGrid 
          products={products} 
          store={store} 
          isLoading={productsLoading} 
        />
      </div>

      <StorefrontFooter />
    </div>
  );
};

export default Storefront;
