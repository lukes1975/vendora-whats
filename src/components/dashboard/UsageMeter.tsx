
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package } from "lucide-react";

interface UsageMeterProps {
  totalProducts: number;
}

const UsageMeter = ({ totalProducts }: UsageMeterProps) => {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-600" />
          Products Added: {totalProducts} / Unlimited (Early Access)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Current usage</span>
            <span>Early Access</span>
          </div>
          <Progress value={Math.min((totalProducts / 50) * 100, 100)} className="h-2" />
          <p className="text-xs text-gray-600">
            Pro users may be limited to 10 products in the future
          </p>
          <div className="bg-blue-50 rounded-lg p-3 mt-3">
            <p className="text-sm text-blue-800">
              🚀 Take advantage of Early Access to grow without limits. Upgrade coming soon.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageMeter;
