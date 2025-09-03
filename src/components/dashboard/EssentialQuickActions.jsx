import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Store, TrendingUp, Users, BarChart3, GraduationCap } from "lucide-react";

const EssentialQuickActions = () => {
  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Marketplace Actions</CardTitle>
        <CardDescription className="text-muted-foreground">Essential actions to dominate the FUOYE Marketplace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link to="/dashboard/products/new" className="block">
          <Button variant="ghost" className="w-full justify-start h-14 text-left p-4 rounded-xl border border-border/50 hover:border-primary/20 hover:bg-primary/5 group transition-all">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">Add Product to Marketplace</div>
                <div className="text-xs text-muted-foreground">Sell to 10,000+ FUOYE students</div>
              </div>
            </div>
          </Button>
        </Link>
        
        <Link to="/fuoye-market" className="block">
          <Button variant="ghost" className="w-full justify-start h-14 text-left p-4 rounded-xl border border-border/50 hover:border-primary/20 hover:bg-primary/5 group transition-all">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">Browse FUOYE Market</div>
                <div className="text-xs text-muted-foreground">See what students are buying</div>
              </div>
            </div>
          </Button>
        </Link>

        <Link to="/dashboard/analytics" className="block">
          <Button variant="ghost" className="w-full justify-start h-14 text-left p-4 rounded-xl border border-border/50 hover:border-primary/20 hover:bg-primary/5 group transition-all">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">Marketplace Analytics</div>
                <div className="text-xs text-muted-foreground">Track your sales performance</div>
              </div>
            </div>
          </Button>
        </Link>

        <Link to="/dashboard/storefront" className="block">
          <Button variant="ghost" className="w-full justify-start h-14 text-left p-4 rounded-xl border border-border/50 hover:border-accent/20 hover:bg-accent/5 group transition-all opacity-75">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">Individual Store (Optional)</div>
                <div className="text-xs text-muted-foreground">Create your own website</div>
              </div>
            </div>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default EssentialQuickActions;