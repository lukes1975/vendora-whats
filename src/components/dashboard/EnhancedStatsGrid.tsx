
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, BarChart3 } from "lucide-react";

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
      title: "Empire Revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: "+12%",
      trendUp: true,
      color: "text-green-600",
      bgColor: "bg-green-50",
      subtitle: "Your wealth is building"
    },
    {
      title: "Customer Conquests",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      trend: "+5%",
      trendUp: true,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      subtitle: "Every chat = respect gained"
    },
    {
      title: "Assets In Arsenal",
      value: totalProducts.toString(),
      icon: Package,
      trend: "+2%",
      trendUp: true,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      subtitle: "Your inventory commands attention"
    },
    {
      title: "Power Per Sale",
      value: `₦${avgOrderValue.toLocaleString()}`,
      icon: BarChart3,
      trend: "+8%",
      trendUp: true,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      subtitle: "Premium prices = business credibility"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-gray-900">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-1">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className={`flex items-center text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {stat.trend}
                </div>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {stat.subtitle}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EnhancedStatsGrid;
