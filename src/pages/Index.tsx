
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Store, MessageSquare, Users, Zap, Check, X, Star, ChevronLeft, ChevronRight, Play, Globe, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

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

  const features = [
    {
      icon: Store,
      title: "Professional Brand Page",
      description: "Tell your story, show your products, and make customers trust you — all before the first message."
    },
    {
      icon: MessageSquare,
      title: "WhatsApp-First Selling",
      description: "Ditch clunky websites. Your store educates buyers upfront so DMs are for closing deals, not Q&A."
    },
    {
      icon: Users,
      title: "Business Status Upgrade",
      description: "Look like a business worth buying from. No more 'small hustle' energy — you're building a brand."
    },
    {
      icon: Zap,
      title: "Always-On Presence",
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
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold text-foreground">Vendora</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#showcase" className="text-muted-foreground hover:text-foreground transition-colors">Showcase</a>
              <a href="#blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            Transform Your Side Hustle Into a
            <span className="text-primary block">Commanding Business Empire</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            Join thousands who've leveled up from scattered DMs to professional storefronts. 
            <strong className="text-foreground">Every click builds your reputation.</strong> Every share multiplies your reach. 
            <strong className="text-foreground">Every sale proves you're unstoppable.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-4 h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl">
                Claim Your Business Empire
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo-store">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-14">
                <Play className="mr-2 h-5 w-5" />
                View Demo Store
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Vendora Section */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Every Pro Started Where You Are Now
          </h2>
          <p className="text-xl text-muted-foreground">
            <strong className="text-primary">The difference?</strong> They chose to build something that commands respect. 
            Today, you level up from scattered to strategic. From invisible to undeniable.
          </p>
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

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Get your professional storefront up and running in minutes
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Showcase Section */}
      <section id="showcase" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              See How Others Are Selling Smarter
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Real stores powered by Vendora
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {showcaseStores.map((store, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="aspect-video bg-muted">
                  <img 
                    src={store.image} 
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-2">{store.category}</Badge>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{store.name}</h3>
                  <p className="text-muted-foreground">{store.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              View Store Showcase
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
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
