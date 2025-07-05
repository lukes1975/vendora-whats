
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeSectionProps {
  storeName?: string;
}

const WelcomeSection = ({ storeName }: WelcomeSectionProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back{storeName ? `, ${storeName}!` : '!'}
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your store today.</p>
      </div>
      <Link to="/dashboard/products/new">
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </Link>
    </div>
  );
};

export default WelcomeSection;
