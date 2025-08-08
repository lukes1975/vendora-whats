import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  status: string;
}

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

interface ProductGridProps {
  products: Product[];
  store: Store;
  isLoading: boolean;
}

const ProductGrid = ({ products, store, isLoading }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="w-full aspect-square rounded-2xl bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-5/6 bg-muted rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-6 w-24 bg-muted rounded" />
                  <div className="h-8 w-28 bg-muted rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">Building something amazing</h3>
            <p>This business is setting up their storefront. Check back soon!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} store={store} />
      ))}
    </div>
  );
};

export default ProductGrid;
