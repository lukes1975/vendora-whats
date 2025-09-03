import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Store, Users, ShoppingBag, Zap, TrendingUp } from "lucide-react";

const MarketplaceHeader = () => {
  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-full animate-pulse">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                FUOYE Marketplace
              </h1>
              <p className="text-muted-foreground text-lg">
                Nigeria's #1 Campus Commerce Platform
              </p>
            </div>
          </div>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            🚀 Where ambition meets opportunity. Buy, sell, and connect with over 10,000 FUOYE students. 
            From textbooks to tech, food to fashion - if students need it, we've got it.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <Store className="h-4 w-4 mr-2" />
              Student-Verified Sellers
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
              <Users className="h-4 w-4 mr-2" />
              10,000+ Active Students
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
              <Zap className="h-4 w-4 mr-2" />
              Instant Campus Delivery
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
              <TrendingUp className="h-4 w-4 mr-2" />
              Real Student Prices
            </Badge>
          </div>

          {/* Success Stories Mini Banner */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              💰 <strong>This Month:</strong> Sarah made ₦85,000 selling textbooks • David sold 50+ electronics • Blessing's food business hit ₦120,000
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Link to="/signup">
                🚀 Start Your Empire
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 border-primary/20 hover:border-primary/40 hover:bg-primary/5">
              <Link to="/dashboard">
                📊 Vendor Dashboard
              </Link>
            </Button>
          </div>

          {/* Quick Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-sm">
            <div className="p-3 bg-background/50 rounded-lg border hover:border-primary/20 transition-colors cursor-pointer">
              <div className="font-medium">📚 Textbooks</div>
              <div className="text-xs text-muted-foreground">Course materials</div>
            </div>
            <div className="p-3 bg-background/50 rounded-lg border hover:border-primary/20 transition-colors cursor-pointer">
              <div className="font-medium">💻 Electronics</div>
              <div className="text-xs text-muted-foreground">Laptops, phones</div>
            </div>
            <div className="p-3 bg-background/50 rounded-lg border hover:border-primary/20 transition-colors cursor-pointer">
              <div className="font-medium">👕 Fashion</div>
              <div className="text-xs text-muted-foreground">Clothes, shoes</div>
            </div>
            <div className="p-3 bg-background/50 rounded-lg border hover:border-primary/20 transition-colors cursor-pointer">
              <div className="font-medium">🍕 Food & More</div>
              <div className="text-xs text-muted-foreground">Everything else</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHeader;