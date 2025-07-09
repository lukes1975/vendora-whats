
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";

interface EnhancedStatsGridProps {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  avgOrderValue: number;
}

const EnhancedStatsGrid = ({ 
  totalRevenue, 
  totalOrders, 
  totalProducts, 
  avgOrderValue 
}: EnhancedStatsGridProps) => {
  const stats = [
    {
      title: "Total Revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Avg Order Value",
      value: `₦${avgOrderValue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EnhancedStatsGrid;
