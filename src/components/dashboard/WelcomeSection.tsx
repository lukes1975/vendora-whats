
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeSectionProps {
  storeName?: string;
}

const WelcomeSection = ({ storeName }: WelcomeSectionProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl p-8 gradient-surface border border-border/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="relative flex flex-col space-y-6 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="min-w-0 flex-1 space-y-3">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight animate-fade-in">
            Welcome back, {storeName ? `${storeName} Builder!` : 'Future Mogul!'}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl animate-fade-in">
            <span className="font-semibold text-foreground">Your empire is working 24/7.</span> Every view builds trust. Every share multiplies reach. Every sale proves you're unstoppable.
          </p>
        </div>
        <div className="flex-shrink-0 animate-scale-in">
          <Link to="/dashboard/products/new">
            <Button variant="premium" size="lg" className="interactive shadow-glow">
              <Plus className="mr-2 h-5 w-5" />
              Expand Your Empire
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
