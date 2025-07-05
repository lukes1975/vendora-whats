
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, MessageSquare, Eye, Package } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - replace with real data from Supabase
  const [products] = useState([
    {
      id: 1,
      name: "Handmade Leather Bag",
      price: 89.99,
      image: "/placeholder.svg",
      status: "active",
      views: 234,
      whatsappClicks: 12,
      category: "Accessories"
    },
    {
      id: 2,
      name: "Ceramic Mug Set",
      price: 24.99,
      image: "/placeholder.svg",
      status: "active",
      views: 156,
      whatsappClicks: 8,
      category: "Home & Kitchen"
    },
    {
      id: 3,
      name: "Vintage Scarf",
      price: 45.00,
      image: "/placeholder.svg",
      status: "draft",
      views: 67,
      whatsappClicks: 3,
      category: "Fashion"
    }
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateWhatsAppLink = (product: any) => {
    const message = `Hi! I'm interested in your ${product.name} for $${product.price}. Can you tell me more about it?`;
    return `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <Link to="/dashboard/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                </div>
                <CardDescription className="text-lg font-bold text-green-600">
                  ${product.price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="flex items-center">
                      <Eye className="mr-1 h-3 w-3" />
                      {product.views} views
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      {product.whatsappClicks} clicks
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to={`/dashboard/products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
                    <a
                      href={generateWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        Test Order
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-500">
                <Package className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first product"}
                </p>
                <Link to="/dashboard/products/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Products;
