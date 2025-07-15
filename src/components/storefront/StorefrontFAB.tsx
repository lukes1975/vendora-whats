import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Link } from "react-router-dom";

interface StorefrontFABProps {
  show: boolean;
}

const StorefrontFAB = ({ show }: StorefrontFABProps) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link to="/dashboard">
        <Button 
          size="lg" 
          className="h-14 w-14 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white border-2 border-background"
        >
          <Edit className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
};

export default StorefrontFAB;