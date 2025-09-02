import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Store, Users, ShoppingBag } from "lucide-react";

const MarketplaceHeader = () => {
  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                FUOYE Marketplace
              </h1>
              <p className="text-muted-foreground text-lg">
                Federal University Oye-Ekiti Student Marketplace
              </p>
            </div>
          </div>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Buy and sell everything you need on campus. From textbooks to electronics, 
            fashion to food - connect with fellow students and local vendors.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Store className="h-4 w-4 mr-2" />
              Student-Verified Sellers
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Users className="h-4 w-4 mr-2" />
              Campus Community
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Safe Transactions
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8">
              <Link to="/signup">
                Start Selling
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link to="/dashboard">
                Vendor Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHeader;