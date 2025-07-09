
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopProductsCardProps {
  products: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
  }>;
}

const TopProductsCard = ({ products }: TopProductsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Products by Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products data available</p>
          ) : (
            products.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <span className="text-sm font-medium truncate">{product.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600">
                    ₦{product.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {product.orders} orders
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProductsCard;
