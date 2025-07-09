
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
          Welcome back{storeName ? `, ${storeName}!` : '!'}
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Here's what's happening with your store today.
        </p>
      </div>
      <div className="flex-shrink-0">
        <Link to="/dashboard/products/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default WelcomeSection;
