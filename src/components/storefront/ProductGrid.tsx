
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
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
