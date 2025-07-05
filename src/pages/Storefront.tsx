import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ExternalLink, Heart, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const Storefront = () => {
  // Mock data - replace with real data from Supabase
  const [store] = useState({
    name: "Sarah's Handmade Crafts",
    description: "Beautiful handmade items crafted with love and attention to detail. Each piece is unique and made to last.",
    whatsappNumber: "+1234567890",
    coverImage: "/placeholder.svg",
    logo: "/placeholder.svg"
  });

  const [products] = useState([
    {
      id: 1,
      name: "Handmade Leather Bag",
      price: 89.99,
      image: "/placeholder.svg",
      description: "Premium leather bag handcrafted with attention to detail"
    },
    {
      id: 2,
      name: "Ceramic Mug Set",
      price: 24.99,
      image: "/placeholder.svg",
      description: "Set of 2 beautiful ceramic mugs perfect for your morning coffee"
    },
    {
      id: 3,
      name: "Vintage Scarf",
      price: 45.00,
      image: "/placeholder.svg",
      description: "Elegant vintage-style scarf made from premium silk"
    },
    {
      id: 4,
      name: "Wooden Picture Frame",
      price: 32.00,
      image: "/placeholder.svg",
      description: "Handcrafted wooden frame perfect for your favorite memories"
    }
  ]);

  const generateWhatsAppLink = (product: any) => {
    const message = `Hi ${store.name}! I'm interested in your ${product.name} for $${product.price}. Can you tell me more about it?`;
    return `https://wa.me/${store.whatsappNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
  };

  const shareStore = () => {
    if (navigator.share) {
      navigator.share({
        title: store.name,
        text: store.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-blue-600 hover:text-blue-700">
              ← Back to Vendora
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={shareStore}>
                <Share2 className="mr-1 h-4 w-4" />
                Share
              </Button>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Edit Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Store Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
          <img
            src={store.coverImage}
            alt="Store cover"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 pb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                />
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {store.name}
                  </h1>
                  <p className="text-gray-600 mb-4 max-w-2xl">
                    {store.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={`https://wa.me/${store.whatsappNumber.replace('+', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-green-600 hover:bg-green-700">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message on WhatsApp
                      </Button>
                    </a>
                    <Button variant="outline">
                      <Heart className="mr-2 h-4 w-4" />
                      Follow Store
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Products</h2>
          <p className="text-gray-600">Discover our carefully curated collection</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-200">
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    ${product.price}
                  </span>
                  <Badge variant="secondary">In Stock</Badge>
                </div>
                <a
                  href={generateWhatsAppLink(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Order on WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">No products yet</h3>
                <p>This store is still setting up their product catalog.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Powered by <span className="font-semibold text-blue-600">Vendora</span>
            </p>
            <p className="text-sm text-gray-500">
              Create your own beautiful storefront today
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Storefront;
