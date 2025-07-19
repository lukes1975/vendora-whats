
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeSectionProps {
  storeName?: string;
}

const WelcomeSection = ({ storeName }: WelcomeSectionProps) => {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Welcome back, {storeName ? `${storeName} Builder!` : 'Future Mogul!'}
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          <strong className="text-gray-900">Your empire is working 24/7.</strong> Every view builds trust. Every share multiplies reach. Every sale proves you're unstoppable.
        </p>
      </div>
      <div className="flex-shrink-0">
        <Link to="/dashboard/products/new">
          <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Expand Your Empire
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default WelcomeSection;
