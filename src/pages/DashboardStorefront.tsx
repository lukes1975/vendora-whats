import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAutoCreateStore } from "@/hooks/useAutoCreateStore";
import DashboardLayout from "@/components/DashboardLayout";
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

const DashboardStorefront = () => {
  const { user } = useAuth();
  useAutoCreateStore();
  
  // Fetch user's store data
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['user-store', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('vendor_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching store:', error);
        throw error;
      }
      
      return data as Store | null;
    },
    enabled: !!user?.id,
  });

  // Fetch products for this store
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['user-store-products', store?.id],
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
    if (store?.slug) {
      const storeUrl = `${window.location.origin}/store/${store.slug}`;
      if (navigator.share) {
        navigator.share({
          title: store.name,
          text: store.description,
          url: storeUrl,
        });
      } else {
        navigator.clipboard.writeText(storeUrl);
      }
    }
  };

  if (storeLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!store) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Setting up your store...</h1>
            <p className="text-gray-600 mb-4">Please wait while we create your storefront.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <StorefrontHeader onShare={shareStore} />
        <StoreProfile store={store} />
        
        {/* Products Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Products</h2>
            <p className="text-gray-600">This is how your customers see your store</p>
          </div>

          <ProductGrid 
            products={products} 
            store={store} 
            isLoading={productsLoading} 
          />
        </div>

        <StorefrontFooter />
      </div>
    </DashboardLayout>
  );
};

export default DashboardStorefront;