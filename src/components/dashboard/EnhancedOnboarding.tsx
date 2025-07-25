import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  Store, 
  Palette, 
  Share2, 
  Zap, 
  ArrowRight,
  Clock,
  Target,
  Trophy,
  ShoppingBag,
  Smartphone
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EnhancedOnboardingProps {
  isVisible: boolean;
  onClose: () => void;
  hasProducts: boolean;
  storeName?: string;
  storeUrl?: string;
  totalProducts?: number;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  timeToComplete: string;
  impact: string;
  completed: boolean;
  actionText: string;
  link?: string;
  category: 'foundation' | 'growth' | 'scale';
}

export default function EnhancedOnboarding({ 
  isVisible, 
  onClose, 
  hasProducts, 
  storeName, 
  storeUrl,
  totalProducts = 0 
}: EnhancedOnboardingProps) {
  const [activeTab, setActiveTab] = useState("foundation");
  const [quickStoreName, setQuickStoreName] = useState(storeName || "");
  const [isUpdatingStore, setIsUpdatingStore] = useState(false);
  const navigate = useNavigate();

  const steps: OnboardingStep[] = [
    // Foundation Steps
    {
      id: "store-name",
      title: "Brand Your Empire",
      description: "Professional names command respect. Your store name is your first impression.",
      timeToComplete: "30 seconds",
      impact: "High",
      completed: !!storeName && storeName.trim() !== "",
      actionText: "Set Store Name",
      category: 'foundation'
    },
    {
      id: "first-product",
      title: "Launch Your First Product",
      description: "Every empire starts with one product. Make it count.",
      timeToComplete: "2 minutes",
      impact: "Critical",
      completed: hasProducts && totalProducts > 0,
      actionText: "Add Product",
      link: "/dashboard/products/new",
      category: 'foundation'
    },
    {
      id: "store-preview",
      title: "Preview Your Storefront",
      description: "See your store through your customers' eyes. Professional appearance = trust.",
      timeToComplete: "30 seconds",
      impact: "Medium",
      completed: !!storeUrl,
      actionText: "View Store",
      link: "/dashboard/storefront",
      category: 'foundation'
    },
    // Growth Steps
    {
      id: "whatsapp-setup",
      title: "Connect WhatsApp Business",
      description: "Turn conversations into sales. Direct customer communication.",
      timeToComplete: "1 minute",
      impact: "High",
      completed: false,
      actionText: "Setup WhatsApp",
      link: "/dashboard/settings",
      category: 'growth'
    },
    {
      id: "share-store",
      title: "Share Your Store",
      description: "No customers = no business. Start spreading your link everywhere.",
      timeToComplete: "1 minute",
      impact: "Critical",
      completed: false,
      actionText: "Share Now",
      category: 'growth'
    },
    {
      id: "add-categories",
      title: "Organize with Categories",
      description: "Professional stores are organized. Make shopping effortless.",
      timeToComplete: "2 minutes",
      impact: "Medium",
      completed: false,
      actionText: "Add Categories",
      link: "/dashboard/categories",
      category: 'growth'
    },
    // Scale Steps
    {
      id: "analytics-review",
      title: "Track Your Growth",
      description: "Data drives decisions. Know your numbers, grow your business.",
      timeToComplete: "1 minute",
      impact: "High",
      completed: false,
      actionText: "View Analytics",
      link: "/dashboard/analytics",
      category: 'scale'
    },
    {
      id: "optimize-products",
      title: "Optimize for Sales",
      description: "Better descriptions = more sales. Professional photos = higher prices.",
      timeToComplete: "5 minutes",
      impact: "High",
      completed: false,
      actionText: "Optimize Products",
      link: "/dashboard/products",
      category: 'scale'
    }
  ];

  const updateStoreName = async () => {
    if (!quickStoreName.trim()) {
      toast.error("Please enter a store name");
      return;
    }

    setIsUpdatingStore(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('stores')
        .update({ name: quickStoreName.trim() })
        .eq('vendor_id', user.id);

      if (error) throw error;

      toast.success("Store name updated successfully!");
      // Force a page refresh to update the dashboard
      window.location.reload();
    } catch (error) {
      console.error("Error updating store name:", error);
      toast.error("Failed to update store name");
    } finally {
      setIsUpdatingStore(false);
    }
  };

  const getStepsByCategory = (category: string) => 
    steps.filter(step => step.category === category);

  const getCompletionStats = (category: string) => {
    const categorySteps = getStepsByCategory(category);
    const completed = categorySteps.filter(step => step.completed).length;
    return { completed, total: categorySteps.length, percentage: (completed / categorySteps.length) * 100 };
  };

  const foundationStats = getCompletionStats('foundation');
  const growthStats = getCompletionStats('growth');
  const scaleStats = getCompletionStats('scale');

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Transform Your Business in 3 Steps
          </DialogTitle>
          <DialogDescription className="text-lg">
            From side hustle to professional business. Follow this proven path to success.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full pr-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="foundation" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Foundation ({foundationStats.completed}/{foundationStats.total})
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Growth ({growthStats.completed}/{growthStats.total})
            </TabsTrigger>
            <TabsTrigger value="scale" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Scale ({scaleStats.completed}/{scaleStats.total})
            </TabsTrigger>
          </TabsList>

          {/* Foundation Tab */}
          <TabsContent value="foundation" className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">🏗️ Build Your Foundation</h3>
              <p className="text-muted-foreground mb-4">
                Every successful business starts with solid foundations. Get these right and everything else becomes easier.
              </p>
              <Progress value={foundationStats.percentage} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {foundationStats.completed} of {foundationStats.total} completed ({Math.round(foundationStats.percentage)}%)
              </p>
            </div>

            {/* Quick Store Name Update */}
            {!storeName && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Setup: Store Name
                  </CardTitle>
                  <CardDescription>
                    Give your business a professional identity in 30 seconds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Your Store Name</Label>
                    <Input
                      id="store-name"
                      value={quickStoreName}
                      onChange={(e) => setQuickStoreName(e.target.value)}
                      placeholder="e.g., Sarah's Fashion Store"
                      className="text-lg"
                    />
                  </div>
                  <Button 
                    onClick={updateStoreName} 
                    disabled={isUpdatingStore || !quickStoreName.trim()}
                    className="w-full"
                  >
                    {isUpdatingStore ? "Updating..." : "Set Store Name"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {getStepsByCategory('foundation').map((step) => (
                <Card key={step.id} className={`transition-all ${step.completed ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                      }`}>
                        {step.completed ? <CheckCircle2 className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{step.title}</h3>
                          <Badge variant={step.impact === 'Critical' ? 'destructive' : step.impact === 'High' ? 'default' : 'secondary'}>
                            {step.impact}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{step.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {step.timeToComplete}
                          </div>
                        </div>
                        
                        {!step.completed && step.link && (
                          <Link to={step.link}>
                            <Button size="sm">
                              {step.actionText} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Growth Tab */}
          <TabsContent value="growth" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">📈 Drive Growth</h3>
              <p className="text-muted-foreground mb-4">
                Foundation complete? Time to grow. These steps will bring customers and increase sales.
              </p>
              <Progress value={growthStats.percentage} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {growthStats.completed} of {growthStats.total} completed ({Math.round(growthStats.percentage)}%)
              </p>
            </div>

            <div className="space-y-4">
              {getStepsByCategory('growth').map((step) => (
                <Card key={step.id} className={`transition-all ${step.completed ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-100 text-green-600' : 'bg-blue-500/10 text-blue-600'
                      }`}>
                        {step.completed ? <CheckCircle2 className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{step.title}</h3>
                          <Badge variant={step.impact === 'Critical' ? 'destructive' : step.impact === 'High' ? 'default' : 'secondary'}>
                            {step.impact}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{step.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {step.timeToComplete}
                          </div>
                        </div>
                        
                        {!step.completed && step.link && (
                          <Link to={step.link}>
                            <Button size="sm" variant="outline">
                              {step.actionText} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Scale Tab */}
          <TabsContent value="scale" className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">🚀 Scale Your Empire</h3>
              <p className="text-muted-foreground mb-4">
                Ready to dominate? These advanced strategies will multiply your revenue and establish market presence.
              </p>
              <Progress value={scaleStats.percentage} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {scaleStats.completed} of {scaleStats.total} completed ({Math.round(scaleStats.percentage)}%)
              </p>
            </div>

            <div className="space-y-4">
              {getStepsByCategory('scale').map((step) => (
                <Card key={step.id} className={`transition-all ${step.completed ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-100 text-green-600' : 'bg-purple-500/10 text-purple-600'
                      }`}>
                        {step.completed ? <CheckCircle2 className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{step.title}</h3>
                          <Badge variant={step.impact === 'Critical' ? 'destructive' : step.impact === 'High' ? 'default' : 'secondary'}>
                            {step.impact}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{step.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {step.timeToComplete}
                          </div>
                        </div>
                        
                        {!step.completed && step.link && (
                          <Link to={step.link}>
                            <Button size="sm" variant="outline">
                              {step.actionText} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        </ScrollArea>

        <div className="flex justify-between items-center pt-6 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Continue Later
          </Button>
          <div className="text-sm text-muted-foreground">
            💡 Tip: Complete foundation steps first for maximum impact
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}