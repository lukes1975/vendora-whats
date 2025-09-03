import { Link } from "react-router-dom";
import { Plus, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const WelcomeSection = ({ storeName }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl p-8 gradient-surface border border-border/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="relative flex flex-col space-y-6 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="min-w-0 flex-1 space-y-3">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight animate-fade-in">
            Welcome back, {storeName ? `${storeName}!` : 'Student Entrepreneur!'}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl animate-fade-in">
            <span className="font-semibold text-foreground">Ready to dominate the FUOYE Marketplace?</span> Connect with thousands of students, sell your products, and build your campus empire. Your success story starts here.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              <span>Connect with 10,000+ FUOYE students</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Store className="h-4 w-4 text-primary" />
              <span>Sell on Nigeria's #1 campus marketplace</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 animate-scale-in space-y-3">
          <Link to="/fuoye-market">
            <Button variant="premium" size="lg" className="interactive shadow-glow w-full">
              <Store className="mr-2 h-5 w-5" />
              Browse Marketplace
            </Button>
          </Link>
          <Link to="/dashboard/products/new">
            <Button variant="outline" size="lg" className="interactive w-full">
              <Plus className="mr-2 h-5 w-5" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;