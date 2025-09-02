import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import MarketplaceFilters from "@/components/marketplace/MarketplaceFilters";
import MarketplaceProductGrid from "@/components/marketplace/MarketplaceProductGrid";
import MarketplaceSearchBar from "@/components/marketplace/MarketplaceSearchBar";
import TrendingSection from "@/components/marketplace/TrendingSection";
import StudentVerificationBanner from "@/components/marketplace/StudentVerificationBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

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
  marketplace_category_id: string;
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
  };
  product_ratings: {
    rating: number;
  }[];
}

interface MarketplaceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const FUOYEMarketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>("recent");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      // Get FUOYE marketplace ID
      const { data: marketplace } = await supabase
        .from("university_marketplaces")
        .select("id")
        .eq("code", "fuoye")
        .single();

      if (!marketplace) {
        throw new Error("FUOYE marketplace not found");
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("marketplace_categories")
        .select("id, name, icon, description")
        .eq("university_id", marketplace.id)
        .eq("is_active", true)
        .order("sort_order");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch all products from active stores
      const { data: productsData, error: productsError } = await supabase
        .from("products")
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
        .eq("stores.is_active", true)
        .eq("status", "active");

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching marketplace data:", error);
      toast({
        title: "Error",
        description: "Failed to load marketplace data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedCategory && product.marketplace_category_id !== selectedCategory) {
      return false;
    }

    // Price filter
    const price = Number(product.price);
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return Number(a.price) - Number(b.price);
      case "price-high":
        return Number(b.price) - Number(a.price);
      case "rating":
        const aRating = a.product_ratings.length > 0 
          ? a.product_ratings.reduce((sum, r) => sum + r.rating, 0) / a.product_ratings.length 
          : 0;
        const bRating = b.product_ratings.length > 0 
          ? b.product_ratings.reduce((sum, r) => sum + r.rating, 0) / b.product_ratings.length 
          : 0;
        return bRating - aRating;
      default: // recent
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      
      <div className="container mx-auto px-4 py-8">
        <StudentVerificationBanner />
        
        <TrendingSection />
        
        <MarketplaceSearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="new">New This Week</TabsTrigger>
            <TabsTrigger value="departments">By Department</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <MarketplaceFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                />
              </div>

              <div className="lg:col-span-3">
                <MarketplaceProductGrid 
                  products={filteredProducts}
                  loading={loading}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="new" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <MarketplaceFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                />
              </div>

              <div className="lg:col-span-3">
                <MarketplaceProductGrid 
                  products={filteredProducts.filter(p => {
                    const productDate = new Date(p.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return productDate > weekAgo;
                  })}
                  loading={loading}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="departments" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <MarketplaceFilters
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                />
              </div>

              <div className="lg:col-span-3">
                <MarketplaceProductGrid 
                  products={filteredProducts}
                  loading={loading}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FUOYEMarketplace;