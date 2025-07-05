
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Store, MessageSquare } from "lucide-react";

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks to manage your store</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link to="/dashboard/products/new">
            <Button variant="outline" className="w-full justify-start h-auto py-3">
              <Plus className="mr-2 h-4 w-4" />
              <span>Add New Product</span>
            </Button>
          </Link>
          <Link to="/dashboard/storefront">
            <Button variant="outline" className="w-full justify-start h-auto py-3">
              <Store className="mr-2 h-4 w-4" />
              <span>View Your Store</span>
            </Button>
          </Link>
          <Link to="/dashboard/settings">
            <Button variant="outline" className="w-full justify-start h-auto py-3">
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>WhatsApp Settings</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
