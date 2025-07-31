import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Store } from "lucide-react";

const EssentialQuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Essential business actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/dashboard/products/new">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
          <Link to="/dashboard/storefront">
            <Button variant="outline" className="w-full justify-start">
              <Store className="mr-2 h-4 w-4" />
              View Store
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EssentialQuickActions;