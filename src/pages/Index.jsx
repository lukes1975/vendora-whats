import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowRight,
  Star,
  Shield,
  Zap,
  MapPin,
  Crown,
  BookOpen,
  Laptop,
  Utensils,
  Shirt
} from "lucide-react";

const Index = () => {
  const stats = [
    { label: "Active Students", value: "10,000+", icon: Users },
    { label: "Products Listed", value: "5,000+", icon: ShoppingBag },
    { label: "Successful Transactions", value: "₦2M+", icon: TrendingUp },
    { label: "Campus Coverage", value: "100%", icon: MapPin }
  ];

  const categories = [
    { name: "Textbooks & Study Materials", icon: BookOpen, count: "1,200+", color: "blue" },
    { name: "Electronics & Gadgets", icon: Laptop, count: "800+", color: "purple" },
    { name: "Food & Beverages", icon: Utensils, count: "600+", color: "green" },
    { name: "Fashion & Accessories", icon: Shirt, count: "900+", color: "pink" }
  ];

  const features = [
    {
      icon: Shield,
      title: "Student-Verified Sellers",
      description: "Every seller is verified with their FUOYE student ID for maximum trust and safety."
    },
    {
      icon: Zap,
      title: "Lightning-Fast Campus Delivery",
      description: "Get your orders delivered anywhere on campus within 15 minutes during peak hours."
    },
    {
      icon: Crown,
      title: "Build Your Campus Empire",
      description: "Turn your side hustle into a thriving business with our vendor tools and analytics."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-bold text-lg">Vendora</div>
                <div className="text-xs text-muted-foreground">FUOYE Marketplace</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/fuoye-market">
                <Button variant="ghost" size="sm">Browse Market</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              🎓 Nigeria's #1 University Marketplace
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Where FUOYE Students{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Build Empires
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Buy, sell, and connect with over 10,000 verified FUOYE students. From textbooks to tech, 
              food to fashion - your campus commerce journey starts here.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <Link to="/signup">
                <Button size="lg" className="px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  🚀 Launch Your Business
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/fuoye-market">
                <Button variant="outline" size="lg" className="px-8">
                  🛍️ Start Shopping
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Real Student Success Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how FUOYE students are building profitable businesses while studying
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Sarah A. - 300L CS</h3>
                <p className="text-2xl font-bold text-green-600 mb-2">₦85K/month</p>
                <p className="text-sm text-muted-foreground">Tech accessories seller</p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">David O. - 400L BA</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">₦120K/month</p>
                <p className="text-sm text-muted-foreground">Campus food business</p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 dark:border-purple-800">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Blessing O. - 200L MC</h3>
                <p className="text-2xl font-bold text-purple-600 mb-2">₦65K/month</p>
                <p className="text-sm text-muted-foreground">Fashion & style</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Categories</h2>
            <p className="text-muted-foreground">
              Everything students need, all in one place
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-${category.color}-100 dark:bg-${category.color}-900/20 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-8 w-8 text-${category.color}-600`} />
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.count} items available</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Vendora?</h2>
            <p className="text-muted-foreground">
              Built specifically for the unique needs of university students
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Build Your Campus Empire?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of FUOYE students who are already earning while studying. 
              Start your business journey today!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="px-8 bg-gradient-to-r from-primary to-accent">
                  🎯 Get Started Now
                </Button>
              </Link>
              <Link to="/fuoye-market">
                <Button variant="outline" size="lg" className="px-8">
                  🔍 Explore Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold">Vendora FUOYE</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Empowering student entrepreneurs since 2024
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;