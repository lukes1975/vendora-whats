import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { 
  Check, 
  Store, 
  Settings, 
  MessageCircle, 
  Building, 
  Heart, 
  Rocket,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Sparkles,
  Target,
  Share2,
  Eye,
  Clock,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";

interface Task {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  route?: string;
  action?: () => void;
  completed: boolean;
  tooltip?: string;
  icon?: React.ReactNode;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  tasks: Task[];
  color: string;
}

interface SetupWizardProps {
  storeData?: any;
  hasProducts: boolean;
  totalProducts: number;
  onTaskComplete?: (taskId: string) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({
  storeData,
  hasProducts,
  totalProducts,
  onTaskComplete
}) => {
  const navigate = useNavigate();
  const { track } = useAnalytics();
  const [openSections, setOpenSections] = useState<string[]>(['store-setup']);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const sections: Section[] = [
    {
      id: 'store-setup',
      title: 'Store Setup',
      icon: <Store className="h-5 w-5" />,
      description: 'Set up your basic store foundation',
      color: 'from-emerald-500 to-teal-600',
      tasks: [
        {
          id: 'add-product',
          title: 'Add your first product',
          description: 'Write a name, add photos, and set a price.',
          buttonText: 'Add Product',
          route: '/products',
          completed: hasProducts,
          tooltip: 'Start building your catalog with your first product',
          icon: <Target className="h-4 w-4" />
        },
        {
          id: 'customize-store',
          title: 'Customize your storefront',
          description: 'Upload your logo, pick brand colors, and write a short tagline or intro.',
          buttonText: 'Customize Store',
          route: '/settings',
          completed: !!storeData?.name,
          tooltip: 'Make your store uniquely yours',
          icon: <Sparkles className="h-4 w-4" />
        },
        {
          id: 'set-store-url',
          title: 'Set your store link',
          description: 'Choose your subdomain (e.g., vendora.store/yourname).',
          buttonText: 'Set Store URL',
          route: '/settings',
          completed: !!storeData?.slug,
          tooltip: 'Create a memorable web address for your store',
          icon: <Share2 className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'store-settings',
      title: 'Store Settings',
      icon: <Settings className="h-5 w-5" />,
      description: 'Configure payments and delivery',
      color: 'from-blue-500 to-indigo-600',
      tasks: [
        {
          id: 'connect-payout',
          title: 'Connect payout account',
          description: 'Enter your bank or mobile money details to receive payments.',
          buttonText: 'Connect Account',
          route: '/settings',
          completed: false,
          tooltip: 'Set up how you\'ll receive your earnings',
          icon: <Zap className="h-4 w-4" />
        },
        {
          id: 'set-delivery',
          title: 'Set shipping/delivery options',
          description: 'Configure delivery zones, flat rates, or free shipping.',
          buttonText: 'Set Delivery',
          route: '/settings',
          completed: false,
          tooltip: 'Define how products reach your customers',
          icon: <Clock className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'messaging-setup',
      title: 'Order & Messaging Setup',
      icon: <MessageCircle className="h-5 w-5" />,
      description: 'Connect communication channels',
      color: 'from-purple-500 to-pink-600',
      tasks: [
        {
          id: 'set-notifications',
          title: 'Choose order notification preference',
          description: 'Select how you\'d like to receive order alerts: WhatsApp, email, or dashboard only.',
          buttonText: 'Set Notification Preference',
          route: '/settings',
          completed: false,
          tooltip: 'Never miss an order with smart notifications',
          icon: <MessageCircle className="h-4 w-4" />
        },
        {
          id: 'connect-whatsapp',
          title: 'Connect your WhatsApp number',
          description: 'Link your WhatsApp so customers can place orders or reach out.',
          buttonText: 'Connect WhatsApp',
          route: '/settings',
          completed: !!storeData?.whatsapp_number,
          tooltip: 'Enable direct customer communication',
          icon: <MessageCircle className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'business-profile',
      title: 'Business Profile',
      icon: <Building className="h-5 w-5" />,
      description: 'Complete your business information',
      color: 'from-orange-500 to-red-600',
      tasks: [
        {
          id: 'add-business-info',
          title: 'Add business information',
          description: 'Input your business name, category, location, and working hours.',
          buttonText: 'Add Business Info',
          route: '/settings',
          completed: false,
          tooltip: 'Help customers learn about your business',
          icon: <Building className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: <Heart className="h-5 w-5" />,
      description: 'Choose your selling method',
      color: 'from-pink-500 to-rose-600',
      tasks: [
        {
          id: 'choose-method',
          title: 'Choose Selling Method',
          description: 'Do you want to sell via WhatsApp only, Website Storefront only, or both?',
          buttonText: 'Choose Method',
          route: '/settings',
          completed: false,
          tooltip: 'Optimize your sales channels',
          icon: <Heart className="h-4 w-4" />
        }
      ]
    },
    {
      id: 'launch-checklist',
      title: 'Launch Checklist',
      icon: <Rocket className="h-5 w-5" />,
      description: 'Final steps to go live',
      color: 'from-teal-500 to-cyan-600',
      tasks: [
        {
          id: 'preview-store',
          title: 'Preview your store',
          description: 'See how your website store looks on desktop and mobile.',
          buttonText: 'Preview Store',
          route: `/storefront/${storeData?.slug || 'preview'}`,
          completed: false,
          tooltip: 'Check your store before customers see it',
          icon: <Eye className="h-4 w-4" />
        },
        {
          id: 'share-store',
          title: 'Share your website store link',
          description: 'Send your website store link to friends or customers (share to WhatsApp, Instagram, Facebook).',
          buttonText: 'Share Website',
          completed: false,
          tooltip: 'Spread the word about your new store',
          icon: <Share2 className="h-4 w-4" />
        },
        {
          id: 'launch-store',
          title: 'Mark store as LIVE',
          description: 'You\'re ready to sell. Activate your store now.',
          buttonText: 'Launch Website Store',
          completed: false,
          tooltip: 'Go live and start selling!',
          icon: <Rocket className="h-4 w-4" />
        }
      ]
    }
  ];

  // Initialize completed tasks based on current state
  useEffect(() => {
    const completed = new Set<string>();
    
    // Check which tasks are already completed
    if (hasProducts) completed.add('add-product');
    if (storeData?.name) completed.add('customize-store');
    if (storeData?.slug) completed.add('set-store-url');
    if (storeData?.whatsapp_number) completed.add('connect-whatsapp');
    
    setCompletedTasks(completed);
  }, [storeData, hasProducts]);

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show confetti when setup is complete
  useEffect(() => {
    const totalTasks = sections.reduce((acc, section) => acc + section.tasks.length, 0);
    const completedCount = completedTasks.size;
    const progressPercentage = (completedCount / totalTasks) * 100;
    
    if (progressPercentage === 100 && !showConfetti) {
      setShowConfetti(true);
      localStorage.setItem('vendora-setup-completed', 'true');
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [completedTasks, sections, showConfetti]);

  const totalTasks = sections.reduce((acc, section) => acc + section.tasks.length, 0);
  const completedTasksCount = completedTasks.size;
  const progressPercentage = (completedTasksCount / totalTasks) * 100;

  const handleTaskClick = (task: Task) => {
    track('button_clicked' as any, { 
      context: 'setup_wizard', 
      taskId: task.id, 
      taskTitle: task.title 
    });
    
    if (task.route) {
      navigate(task.route);
    } else if (task.action) {
      task.action();
    }
    
    if (onTaskComplete) {
      onTaskComplete(task.id);
    }
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleAIAssist = () => {
    setShowAIAssist(true);
    track('button_clicked' as any, { 
      context: 'setup_wizard_ai_assist' 
    });
    // TODO: Implement AI assistance modal
  };

  const getSectionProgress = (section: Section) => {
    const sectionCompletedTasks = section.tasks.filter(task => completedTasks.has(task.id)).length;
    return (sectionCompletedTasks / section.tasks.length) * 100;
  };

  return (
    <div className="space-y-6 relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-teal-500/10 rounded-2xl p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Setup Your Store</h2>
            <p className="text-muted-foreground mt-1">Complete these steps to launch your business</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIAssist}
            className="hidden sm:flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            AI Smart Start
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedTasksCount} of {totalTasks} tasks completed
            </span>
            <span className="font-medium text-primary">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          {progressPercentage === 100 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-emerald-600 font-medium"
            >
              🎉 Congratulations! Your store is ready to launch!
            </motion.div>
          )}
        </div>
      </div>

      {/* Setup Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isOpen = openSections.includes(section.id);
          const sectionProgress = getSectionProgress(section);
          const isCompleted = sectionProgress === 100;

          return (
            <Card key={section.id} className="overflow-hidden">
              <Collapsible open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg bg-gradient-to-r text-white",
                          section.color
                        )}>
                          {section.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{section.title}</h3>
                            {isCompleted && (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                <Check className="h-3 w-3 mr-1" />
                                Complete
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">{section.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {section.tasks.filter(task => completedTasks.has(task.id)).length}/{section.tasks.length}
                          </div>
                          <div className="text-xs text-muted-foreground">tasks</div>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {sectionProgress > 0 && (
                      <Progress value={sectionProgress} className="mt-3 h-2" />
                    )}
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-3">
                      {section.tasks.map((task) => {
                        const isTaskCompleted = completedTasks.has(task.id);
                        
                        return (
                          <TooltipProvider key={task.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className={cn(
                                    "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                                    isTaskCompleted 
                                      ? "bg-emerald-50 border-emerald-200" 
                                      : "bg-background border-border hover:border-primary/30"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "p-2 rounded-lg",
                                      isTaskCompleted 
                                        ? "bg-emerald-100 text-emerald-600" 
                                        : "bg-accent text-muted-foreground"
                                    )}>
                                      {isTaskCompleted ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        task.icon || <Target className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{task.title}</h4>
                                      <p className="text-sm text-muted-foreground">{task.description}</p>
                                    </div>
                                  </div>
                                  <Button
                                    variant={isTaskCompleted ? "secondary" : "default"}
                                    size="sm"
                                    onClick={() => handleTaskClick(task)}
                                    disabled={isTaskCompleted}
                                  >
                                    {isTaskCompleted ? "Completed" : task.buttonText}
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              {task.tooltip && (
                                <TooltipContent>
                                  <p>{task.tooltip}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Mobile AI Assist Button */}
      <div className="sm:hidden fixed bottom-20 right-4 z-50">
        <Button
          onClick={handleAIAssist}
          className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
          size="lg"
        >
          <Lightbulb className="h-5 w-5 mr-2" />
          AI Help
        </Button>
      </div>
    </div>
  );
};

export default SetupWizard;