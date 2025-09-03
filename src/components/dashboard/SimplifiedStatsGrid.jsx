import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";

const SimplifiedStatsGrid = ({ 
  totalRevenue, 
  totalOrders, 
  totalProducts 
}) => {
  const stats = [
    {
      title: "Marketplace Revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      darkBgGradient: "from-green-950/50 to-emerald-950/50",
      description: "Total earnings from FUOYE students"
    },
    {
      title: "Campus Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50",
      darkBgGradient: "from-blue-950/50 to-cyan-950/50",
      description: "Orders from fellow students"
    },
    {
      title: "Active Products",
      value: totalProducts.toString(),
      icon: Package,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      darkBgGradient: "from-purple-950/50 to-pink-950/50",
      description: "Items in the marketplace"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className={`relative overflow-hidden border-0 bg-gradient-to-br ${stat.bgGradient} dark:${stat.darkBgGradient} hover-lift group`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/20 dark:from-white/5 dark:to-white/10"></div>
            <CardHeader className="relative flex flex-row items-center justify-between pb-3 z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.title}
              </CardTitle>
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative pt-0 z-10">
              <div className="text-3xl font-bold text-foreground tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SimplifiedStatsGrid;