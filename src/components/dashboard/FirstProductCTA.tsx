
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Rocket } from "lucide-react";

interface FirstProductCTAProps {
  hasProducts: boolean;
}

const FirstProductCTA = ({ hasProducts }: FirstProductCTAProps) => {
  if (hasProducts) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent">
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Rocket className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Ready to sell?
                </p>
                <p className="text-xs text-gray-500">
                  Add your first product now
                </p>
              </div>
            </div>
            <Link to="/dashboard/products/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstProductCTA;
