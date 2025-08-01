import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Store } from "lucide-react";

const EssentialQuickActions = () => {
  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        <CardDescription className="text-muted-foreground">Essential business actions to grow your store</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link to="/dashboard/products/new" className="block">
          <Button variant="ghost" className="w-full justify-start h-14 text-left p-4 rounded-xl border border-border/50 hover:border-primary/20 hover:bg-primary/5 group transition-all">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">Add Product</div>
                <div className="text-xs text-muted-foreground">Expand your catalog</div>
              </div>
            </div>
          </Button>
        </Link>
        <Link to="/dashboard/storefront" className="block">
          <Button variant="ghost" className="w-full justify-start h-14 text-left p-4 rounded-xl border border-border/50 hover:border-primary/20 hover:bg-primary/5 group transition-all">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">View Store</div>
                <div className="text-xs text-muted-foreground">See your live storefront</div>
              </div>
            </div>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default EssentialQuickActions;