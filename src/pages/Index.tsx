
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Store, MessageSquare, Users, Zap, Check, X, Star, ChevronLeft, ChevronRight, Play, Globe, Instagram, MessageCircle, Shield, Clock, TrendingUp, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface PricingPlan {
  name: string;
  price: { monthly: number; yearly: number };
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  discount?: string;
}

const Index = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [sellerCount, setSellerCount] = useState(2300);
  const [currentWord, setCurrentWord] = useState(0);
  
  const dynamicWords = ["WhatsApp", "Instagram", "Social Media"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % dynamicWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSellerCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Store,
      title: "Business is war. Vendora is your weapon.",
      description: "Tell your story, show your products, and make customers trust you — all before the first message."
    },
    {
      icon: MessageSquare,
      title: "Add a product in 30 seconds. Sell it in 3 minutes.",
      description: "Ditch clunky websites. Your store educates buyers upfront so DMs are for closing deals, not Q&A."
    },
    {
      icon: Users,
      title: "Automation that feels like hiring your first assistant.",
      description: "Look like a business worth buying from. No more 'small hustle' energy — you're building a brand."
    },
    {
      icon: Zap,
      title: "Dashboard clarity. No guesswork. Real growth.",
      description: "Even while you sleep, your storefront works for you — 24/7 sales link that never takes a break."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Store",
      description: "Take minutes"
    },
    {
      step: "2", 
      title: "Add Products & Info",
      description: "No tech skills needed"
    },
    {
      step: "3",
      title: "Share Link Anywhere", 
      description: "WhatsApp, Instagram, bio"
    },
    {
      step: "4",
      title: "Close Deals via DM",
      description: "Store does the pre-selling"
    }
  ];

  const showcaseStores = [
    {
      name: "GlowByAmaka",
      category: "Beauty & Skincare",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
      description: "Premium skincare products with natural ingredients"
    },
    {
      name: "Tosin's Thrift",
      category: "Fashion",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400", 
      description: "Curated fashion pieces for the modern professional"
    },
    {
      name: "TechHub Nigeria", 
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400",
      description: "Latest gadgets and tech accessories"
    }
  ];

  const testimonials = [
    {
      quote: "Vendora gave my business structure without losing the WhatsApp touch. My orders tripled in one week.",
      author: "Amaka",
      title: "CEO of GlowByAmaka",
      rating: 5
    },
    {
      quote: "Before Vendora, people would ghost. Now, they browse my store, ask fewer questions, and just order.",
      author: "Tosin",
      title: "Thrift Seller",
      rating: 5
    },
    {
      quote: "I look like a real business now. Customers take me seriously and my prices reflect that professionalism.",
      author: "David",
      title: "Tech Retailer",
      rating: 5
    }
  ];

  const comparisonFeatures = [
    { feature: "Branded Storefront", vendora: true, whatsapp: false, shopify: true },
    { feature: "WhatsApp Integration", vendora: true, whatsapp: true, shopify: false },
    { feature: "Designed for DMs", vendora: true, whatsapp: true, shopify: false },
    { feature: "Monthly Fees", vendora: "Free/Low", whatsapp: "Free", shopify: "High" },
    { feature: "Easy Setup", vendora: true, whatsapp: true, shopify: false },
    { feature: "Professional Look", vendora: true, whatsapp: false, shopify: true },
    { feature: "Mobile-First", vendora: true, whatsapp: true, shopify: false }
  ];

  const pricingPlans: PricingPlan[] = [
    {
      name: "Starter",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started",
      features: [
        "Create your store",
        "Add limited products", 
        "WhatsApp integration",
        "Basic analytics",
        "Mobile-optimized storefront"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Starter Plan",
      price: { monthly: 3000, yearly: 30600 }, // 15% off for yearly: 3000 * 12 * 0.85 = 30,600
      description: "For serious sellers",
      features: [
        "Everything in Free",
        "Add unlimited products",
        "Custom domain",
        "Advanced analytics", 
        "AI selling assistant",
        "Priority support",
        "Custom branding",
        "Automation tools"
      ],
      cta: "Go Starter",
      popular: false,
      discount: "15% off annual billing"
    },
    {
      name: "Pro Plan", 
      price: { monthly: 7500, yearly: 76500 }, // 15% off for yearly: 7500 * 12 * 0.85 = 76,500
      description: "For growing businesses",
      features: [
        "Everything in Starter",
        "White-label solution",
        "Advanced integrations",
        "Bulk messaging",
        "API access",
        "Dedicated support",
        "Custom workflows"
      ],
      cta: "Go Pro",
      popular: true,
      discount: "15% off annual billing"
    }
  ];

  const blogPosts = [
    {
      title: "7 Mistakes Sellers Make on WhatsApp",
      excerpt: "Avoid these common pitfalls that cost you sales",
      readTime: "5 min read"
    },
    {
      title: "How to Sell Without Feeling Salesy", 
      excerpt: "Build trust and close deals naturally",
      readTime: "7 min read"
    },
    {
      title: "WhatsApp Store vs Instagram Bio Link",
      excerpt: "Which platform drives more conversions?",
      readTime: "4 min read"
    }
  ];

  const faqs = [
    {
      question: "What is Vendora?",
      answer: "Vendora is a platform that gives WhatsApp sellers a professional branded storefront. Instead of just sharing product photos in chats, you get a beautiful store page that educates customers before they message you."
    },
    {
      question: "Do I need a website?",
      answer: "No! Vendora replaces the need for a traditional website. Your Vendora store is designed specifically for social selling and works perfectly with WhatsApp, Instagram, and other platforms."
    },
    {
      question: "Can I use it without coding skills?",
      answer: "Absolutely! Vendora is built for non-technical users. You can set up your entire store, add products, and start selling in under 5 minutes — no coding required."
    },
    {
      question: "How does it integrate with WhatsApp?",
      answer: "When customers visit your Vendora store, they can browse your products and info, then click to message you directly on WhatsApp to place orders. It's seamless!"
    },
    {
      question: "Can I customize my store?",
      answer: "Yes! You can add your logo, brand colors, story, product photos, and all your business information. Pro users get even more customization options."
    },
    {
      question: "Is there a free plan?",
      answer: "Yes! Our Starter plan is completely free and includes everything you need to create a professional storefront and start selling."
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation Bar */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0">
              <Store className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 flex-shrink-0" />
              <span className="text-lg sm:text-2xl font-bold text-foreground truncate">Vendora</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#showcase" className="text-muted-foreground hover:text-foreground transition-colors">Showcase</a>
              <a href="#blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="text-xs sm:text-sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 px-3 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-gradient-xy"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Trust indicator floating badge */}
          <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in px-4">
            <div className="flex items-center gap-2 bg-success/10 text-success border border-success/20 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Trusted by {sellerCount.toLocaleString()}+ African sellers</span>
            </div>
          </div>
          
          {/* Logo */}
          <div className="flex justify-center mb-8 sm:mb-12 animate-scale-in">
            <img 
              src="/lovable-uploads/7ea27942-32b4-47b5-8d40-55f11cd46372.png" 
              alt="Vendora" 
              className="h-10 sm:h-14 w-auto"
            />
          </div>
          
          {/* Main headline with dynamic typing effect */}
          <div className="text-center px-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-light text-foreground mb-4 sm:mb-6 tracking-tight animate-fade-in leading-tight">
              <span className="block">Transform Your</span>{" "}
              <span className="relative">
                <span className="text-primary font-medium transition-all duration-500">
                  {dynamicWords[currentWord]}
                </span>
              </span>
              <br />
              <span className="block font-medium text-primary mt-1 sm:mt-2">Into a Full Online Store</span>
              <span className="block text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-muted-foreground font-light mt-2 sm:mt-4">
                — in Minutes
              </span>
            </h1>
            
            {/* Enhanced subheadline */}
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
              <span className="text-foreground font-medium">Sell smarter, faster, and more professionally</span> — all from your phone. 
              <br className="block sm:hidden" />
              No websites. No complexity. Just results.
            </p>
            
            {/* CTAs with urgency */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 animate-scale-in" style={{animationDelay: '0.4s'}}>
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" variant="hero" className="group shadow-floating hover:shadow-glow w-full sm:w-auto">
                  <span className="text-sm sm:text-base">Create Your Store Free</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/demo-store" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="group border border-border/50 hover:border-primary/30 w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                  <span className="text-sm sm:text-base">Watch 60-sec Demo</span>
                </Button>
              </Link>
            </div>
            
            {/* Trust signals */}
            <div className="text-center space-y-3 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                  <span className="whitespace-nowrap">No credit card required</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span className="whitespace-nowrap">Setup in 3 minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
                  <span className="whitespace-nowrap">Mobile-first design</span>
                </div>
              </div>
              
              {/* Floating testimonial preview */}
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-card/80 backdrop-blur-sm border border-border/50 px-3 sm:px-6 py-2 sm:py-3 rounded-full shadow-md hover:shadow-lg transition-all max-w-sm mx-auto">
                <div className="flex -space-x-1 sm:-space-x-2">
                  <img className="h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 border-background" src="https://images.unsplash.com/photo-1494790108755-2616b612681c?w=100&h=100&fit=crop&crop=face" alt="Seller" />
                  <img className="h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 border-background" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Seller" />
                  <img className="h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 border-background" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face" alt="Seller" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-2 w-2 sm:h-3 sm:w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">"Tripled my sales in one week" - Amaka, Lagos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 sm:py-12 bg-muted/20 border-y border-border/50 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium px-4">Join thousands of merchants building modern stores with Vendora</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-12 opacity-60 hover:opacity-80 transition-opacity">
            {/* Placeholder business logos - replace with real ones */}
            <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-lg font-semibold text-muted-foreground">
              <Store className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="whitespace-nowrap">FashionHub</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-lg font-semibold text-muted-foreground">
              <Smartphone className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="whitespace-nowrap">TechMart</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-lg font-semibold text-muted-foreground">
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="whitespace-nowrap">GrowthCo</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-lg font-semibold text-muted-foreground">
              <Users className="h-4 w-4 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="whitespace-nowrap">CommunityStore</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Vendora Section - Enhanced */}
      <section className="py-20 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
              The Vendora Advantage
            </Badge>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 tracking-tight">
              Every Pro Started Where You Are Now
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              <span className="text-primary font-semibold">The difference?</span> They chose to build something that commands respect. 
              <br className="hidden md:block" />
              Today, you level up from <span className="text-destructive">scattered</span> to <span className="text-success">strategic</span>. 
              From <span className="text-destructive">invisible</span> to <span className="text-primary font-semibold">undeniable</span>.
            </p>
          </div>
          
          {/* Before/After comparison cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <X className="h-5 w-5" />
                  Before Vendora
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left space-y-3">
                <p className="text-muted-foreground">• Sharing random photos in WhatsApp chats</p>
                <p className="text-muted-foreground">• Answering the same questions 100 times</p>
                <p className="text-muted-foreground">• Looking like a small-time hustle</p>
                <p className="text-muted-foreground">• Customers ghosting after endless back-and-forth</p>
              </CardContent>
            </Card>
            
            <Card className="border-success/20 bg-success/5 transform hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="text-success flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  With Vendora
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left space-y-3">
                <p className="text-foreground font-medium">• Professional storefront that sells while you sleep</p>
                <p className="text-foreground font-medium">• Customers browse, learn, then buy</p>
                <p className="text-foreground font-medium">• Brand that commands premium prices</p>
                <p className="text-foreground font-medium">• WhatsApp DMs become closing conversations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <feature.icon className="h-16 w-16 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced 3-Step */}
      <section className="py-20 bg-background relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              Simple Setup Process
            </Badge>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 tracking-tight">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Go from idea to income in 3 simple steps. No technical skills required.
            </p>
          </div>
          
          {/* Enhanced 3-step process */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30"></div>
            
            {[
              {
                step: "1",
                title: "Set Up Store",
                description: "Add your logo, info & products in 3 minutes",
                icon: Store,
                highlight: "Takes minutes"
              },
              {
                step: "2", 
                title: "Share Your Link",
                description: "Copy, paste anywhere - WhatsApp, Instagram, bio",
                icon: MessageSquare,
                highlight: "Copy & paste"
              },
              {
                step: "3",
                title: "Get Orders via DM",
                description: "Customers browse first, then message to buy",
                icon: TrendingUp,
                highlight: "Close deals"
              }
            ].map((step, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-all duration-300">
                <div className="relative mb-6">
                  <div className="bg-gradient-to-br from-primary to-accent text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto shadow-glow group-hover:shadow-floating transition-all">
                    {step.step}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-success text-white text-xs px-2 py-1 rounded-full font-medium">
                    {step.highlight}
                  </div>
                </div>
                
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 h-full hover:bg-card transition-all group-hover:shadow-md">
                  <step.icon className="h-8 w-8 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA after steps */}
          <div className="text-center mt-12">
            <Link to="/signup">
              <Button variant="premium" size="lg" className="shadow-glow hover:shadow-floating">
                Start Your Store Now - It's Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-3">
              ⏱️ Average setup time: <span className="text-primary font-medium">2 minutes 47 seconds</span>
            </p>
          </div>
        </div>
      </section>

      {/* Store Showcase Section */}
      <section id="showcase" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 tracking-tight">
              See How Others Are Selling Smarter
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Real African businesses growing with professional storefronts
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "GlowByAmaka",
                category: "Beauty & Skincare",
                location: "Lagos, Nigeria",
                image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
                description: "Premium skincare products with natural ingredients",
                growth: "+300% sales in 2 weeks",
                rating: 4.9
              },
              {
                name: "Tosin's Thrift Palace",
                category: "Fashion",
                location: "Abuja, Nigeria", 
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
                description: "Curated fashion pieces for the modern professional",
                growth: "+250% customer trust",
                rating: 4.8
              },
              {
                name: "TechHub Naija",
                category: "Electronics",
                location: "Port Harcourt, Nigeria",
                image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400", 
                description: "Latest gadgets and tech accessories",
                growth: "+400% order completion",
                rating: 5.0
              }
            ].map((store, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-border/50 hover:border-primary/20">
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img 
                    src={store.image} 
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{store.rating}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-success/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {store.growth}
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="mb-2">{store.category}</Badge>
                    <span className="text-xs text-muted-foreground">{store.location}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{store.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{store.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      View Store
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="group">
              Explore More Success Stories
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              💡 <span className="text-primary font-medium">Pro tip:</span> These sellers started with zero tech skills, just like you
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Compare Vendora
            </h2>
            <p className="text-xl text-muted-foreground">
              See how we stack up against the alternatives
            </p>
          </div>
          
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                    <th className="text-center p-4 font-semibold text-primary">Vendora</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">WhatsApp Only</th>
                    <th className="text-center p-4 font-semibold text-muted-foreground">Shopify</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr key={index} className="border-b border-border last:border-b-0">
                      <td className="p-4 text-foreground">{item.feature}</td>
                      <td className="p-4 text-center">
                        {typeof item.vendora === 'boolean' ? (
                          item.vendora ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-primary font-semibold">{item.vendora}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof item.whatsapp === 'boolean' ? (
                          item.whatsapp ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">{item.whatsapp}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof item.shopify === 'boolean' ? (
                          item.shopify ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">{item.shopify}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by Sellers Worldwide
            </h2>
            <p className="text-xl text-muted-foreground">
              Real stories from real entrepreneurs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-foreground mb-6 text-lg leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-muted-foreground">{testimonial.title}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Choose the plan that fits your ambition
            </p>
            
            <div className="flex items-center justify-center space-x-3">
              <span className={`text-sm ${!isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isYearly ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm ${isYearly ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Yearly</span>
              <Badge variant="secondary" className="ml-2">Save 15%</Badge>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative p-8 ${plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center p-0 mb-6">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      ₦{isYearly ? plan.price.yearly.toLocaleString() : plan.price.monthly.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                    {plan.discount && isYearly && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        {plan.discount}
                      </div>
                    )}
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup">
                    <Button className="w-full" size="lg" variant={plan.popular ? "default" : "outline"}>
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Learn & Grow
            </h2>
            <p className="text-xl text-muted-foreground">
              Master the art of social selling
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                  <CardDescription className="text-base">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-muted-foreground">{post.readTime}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Read Blog
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about Vendora
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="text-center mt-12">
            <Button variant="outline">
              Visit Help Center
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/90 to-accent/90">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            Stop Waiting. Start Building.
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            You're no longer just selling from your phone. Now you're running a business that looks global.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4 h-14">
              Create Your Store Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <Store className="h-8 w-8 text-primary mr-2" />
                <span className="text-2xl font-bold text-foreground">Vendora</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Transform your hustle into a professional brand with WhatsApp-first selling.
              </p>
              <div className="flex space-x-4">
                <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                <Globe className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#showcase" className="text-muted-foreground hover:text-foreground transition-colors">Showcase</a></li>
                <li><Link to="/demo-store" className="text-muted-foreground hover:text-foreground transition-colors">Demo Store</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-muted-foreground">
                © 2024 Vendora. All rights reserved.
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-sm text-muted-foreground">Made with ❤️ for ambitious sellers</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
