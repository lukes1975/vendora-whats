
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ExternalLink, Heart, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Store {
  id: string;
  name: string;
  description: string;
  whatsapp_number: string;
  logo_url: string;
  cover_image_url: string;
  slug: string;
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
      if (!store?.id || products.length > 0 || productsLoading) return;
      
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

  const generateWhatsAppLink = (product: Product) => {
    if (!store?.whatsapp_number) return '#';
    
    const message = `Hi ${store.name}! I'm interested in your ${product.name} for ₦${product.price.toLocaleString()}. Can you tell me more about it?`;
    const cleanPhone = store.whatsapp_number.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

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
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-blue-600 hover:text-blue-700">
              ← Back to Vendora
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={shareStore}>
                <Share2 className="mr-1 h-4 w-4" />
                Share
              </Button>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Edit Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Store Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
          {store.cover_image_url ? (
            <img
              src={store.cover_image_url}
              alt="Store cover"
              className="w-full h-full object-cover mix-blend-overlay"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
          )}
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 pb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <img
                  src={store.logo_url || "/placeholder.svg"}
                  alt={store.name}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                />
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {store.name}
                  </h1>
                  <p className="text-gray-600 mb-4 max-w-2xl">
                    {store.description || "Welcome to our store!"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {store.whatsapp_number && (
                      <a
                        href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-green-600 hover:bg-green-700">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message on WhatsApp
                        </Button>
                      </a>
                    )}
                    <Button variant="outline">
                      <Heart className="mr-2 h-4 w-4" />
                      Follow Store
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Products</h2>
          <p className="text-gray-600">Discover our carefully curated collection</p>
        </div>

        {productsLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-200">
                <div className="aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      ₦{product.price.toLocaleString()}
                    </span>
                    <Badge variant="secondary">In Stock</Badge>
                  </div>
                  <a
                    href={generateWhatsAppLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Order on WhatsApp
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">No products yet</h3>
                <p>This store is still setting up their product catalog.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Powered by <span className="font-semibold text-blue-600">Vendora</span>
            </p>
            <p className="text-sm text-gray-500">
              Create your own beautiful storefront today
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Storefront;
