
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LowStockAlertProps {
  products: Array<{
    id: string;
    name: string;
    stock: number;
    threshold: number;
  }>;
}

const LowStockAlert = ({ products }: LowStockAlertProps) => {
  // Filter products that are actually low in stock (stock <= threshold)
  const lowStockItems = products.filter(product => 
    product.stock <= product.threshold && product.stock > 0
  );

  // Don't render anything if no products are low in stock
  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center">
          <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
          Low Stock Alert ({lowStockItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lowStockItems.map((product) => (
            <Alert key={product.id} className="border-orange-200 bg-orange-50">
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm font-medium">{product.name}</span>
                <Badge variant="destructive" className="text-xs">
                  {product.stock} left
                </Badge>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockAlert;
