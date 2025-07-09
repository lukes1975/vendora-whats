
import { Button } from "@/components/ui/button";
import { Share2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface StorefrontHeaderProps {
  onShare: () => void;
}

const StorefrontHeader = ({ onShare }: StorefrontHeaderProps) => {
  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            ← Back to Vendora
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="mr-1 h-4 w-4" />
              Share
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-1 h-4 w-4" />
                Manage Your Brand
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorefrontHeader;
