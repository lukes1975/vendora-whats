import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, GraduationCap, Users } from "lucide-react";

const FirstProductCTA = ({ hasProducts }) => {
  if (hasProducts) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-background dark:via-background">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Join the FUOYE Marketplace
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Connect with 10,000+ students instantly
                </p>
              </div>
            </div>
            <Link to="/dashboard/products/new">
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg">
                <Plus className="h-4 w-4 mr-1" />
                Start Selling
              </Button>
            </Link>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>📚 Textbooks</span>
              <span>💻 Electronics</span>
              <span>👕 Fashion</span>
              <span>🍕 Food</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstProductCTA;