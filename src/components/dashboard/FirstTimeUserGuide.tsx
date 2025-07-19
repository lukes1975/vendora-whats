import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, CheckCircle2, Store, Plus, Palette, Share2, Zap } from "lucide-react";

interface FirstTimeUserGuideProps {
  isVisible: boolean;
  onClose: () => void;
  hasProducts: boolean;
  storeName?: string;
  storeUrl?: string;
  totalProducts?: number;
}

interface Step {
  id: string;
  title: string;
  emoji: string;
  description: string;
  action: string;
  link: string;
  completed: boolean;
}

export default function FirstTimeUserGuide({ 
  isVisible, 
  onClose, 
  hasProducts, 
  storeName, 
  storeUrl,
  totalProducts = 0 
}: FirstTimeUserGuideProps) {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps: Step[] = [
    {
      id: "store-info",
      title: "Claim Your Business Identity",
      emoji: "👑",
      description: "Transform from anonymous seller to recognized brand. Your name is your power.",
      action: "Build Your Brand",
      link: "/dashboard/settings",
      completed: !!storeName && storeName.trim() !== ""
    },
    {
      id: "first-product",
      title: "Launch Your First Asset",
      emoji: "🚀",
      description: "Every product proves your expertise. Every upload builds your credibility.",
      action: "Create Your Legacy",
      link: "/dashboard/products/new",
      completed: hasProducts && totalProducts > 0
    },
    {
      id: "customize-store",
      title: "Command Visual Respect",
      emoji: "⚡",
      description: "Professional design = instant credibility. Make them remember you.",
      action: "Dominate The Look",
      link: "/dashboard/storefront",
      completed: false // Could be enhanced to check for logo/customizations
    },
    {
      id: "share-store",
      title: "Multiply Your Reach",
      emoji: "📈",
      description: "Every share expands your empire. Turn one link into endless opportunities.",
      action: "Amplify Your Power",
      link: "/dashboard",
      completed: !!storeUrl
    },
    {
      id: "first-sale",
      title: "Empire Status: ACTIVE",
      emoji: "🏆",
      description: "You're no longer just a seller. You're a business owner. Customers will feel the difference.",
      action: "Rule Your Market",
      link: "/dashboard",
      completed: totalProducts > 0 && !!storeName && !!storeUrl
    }
  ];

  const completedCount = steps.filter(step => step.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  useEffect(() => {
    const newCompleted = steps.filter(step => step.completed).map(step => step.id);
    setCompletedSteps(newCompleted);
  }, [hasProducts, storeName, storeUrl, totalProducts]);

  const handleStepAction = (step: Step) => {
    if (step.id === "share-store" || step.id === "first-sale") {
      // Handle special actions that don't navigate
      return;
    }
    // Navigation is handled by Link component
  };

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Your Empire Starts Now! 🏆</DialogTitle>
              <DialogDescription className="text-base mt-2">
                <strong className="text-foreground">3 minutes to transformation.</strong> From scattered DMs to commanding business presence. Every step builds your professional reputation.
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Setup Progress</span>
                <Badge variant={completedCount === steps.length ? "default" : "secondary"}>
                  {completedCount}/{steps.length} Complete
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              {completedCount === steps.length && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 shadow-md">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-bold">🏆 EMPIRE STATUS: ACTIVATED! You're officially a business owner, not just a seller!</span>
                    </div>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card key={step.id} className={`transition-all ${step.completed ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        step.completed 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {step.completed ? <CheckCircle2 className="h-5 w-5" /> : step.emoji}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Step {index + 1}
                        </Badge>
                        {step.completed && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            ✓ Done
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                      
                      {!step.completed && (
                        <Link to={step.link}>
                          <Button size="sm" className="w-full sm:w-auto">
                            {step.action}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Need help? Check out our{" "}
              <Button variant="link" className="p-0 h-auto text-sm">
                quick video tutorials
              </Button>
            </p>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              I'll finish this later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}