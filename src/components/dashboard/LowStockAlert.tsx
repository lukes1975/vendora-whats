
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
  const lowStockItems = products.filter(product => product.stock <= product.threshold);

  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center">
          <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
          Low Stock Alert
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
