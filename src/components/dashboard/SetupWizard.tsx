import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronRight,
  Store,
  Package,
  Settings,
  MessageSquare,
  Building2,
  Sliders,
  Rocket,
  Bot,
  HelpCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSetupProgress } from '@/hooks/useSetupProgress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SetupCompletionCelebration from './SetupCompletionCelebration';
import BankAccountForm from './setup-forms/BankAccountForm';
import DeliveryOptionsForm from './setup-forms/DeliveryOptionsForm';
import NotificationPreferencesForm from './setup-forms/NotificationPreferencesForm';
import SellingMethodForm from './setup-forms/SellingMethodForm';

interface SetupWizardProps {
  onTaskComplete?: () => void;
  onSetupComplete?: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ 
  onTaskComplete,
  onSetupComplete 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { 
    setupProgress, 
    isLoading, 
    markTaskCompleted, 
    detectTaskCompletion,
    validateAllTasks,
    validateAndUpdateTask,
    TASK_DEFINITIONS 
  } = useSetupProgress();
  
  // State management
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    store_setup: true, // Default open
    store_settings: false,
    order_messaging: false,
    business_profile: false,
    preferences: false,
    launch_checklist: false,
  });
  
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Form modals state
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [showDeliveryOptionsForm, setShowDeliveryOptionsForm] = useState(false);
  const [showNotificationPreferencesForm, setShowNotificationPreferencesForm] = useState(false);
  const [showSellingMethodForm, setShowSellingMethodForm] = useState(false);
  const [userStore, setUserStore] = useState<any>(null);

  // Task definitions with all required data
  const sections = [
    {
      id: 'store_setup',
      title: 'Store Setup',
      icon: Store,
      description: 'Get your basic store ready',
      color: 'emerald',
      tasks: [
        {
          id: 'add_first_product',
          title: 'Add your first product',
          description: 'Write a name, add photos, and set a price.',
          buttonText: 'Add Product',
          route: '/products',
          completed: setupProgress?.tasks['add_first_product']?.completed || false,
          tooltip: 'Products are the foundation of your store',
          icon: Package,
        },
        {
          id: 'customize_storefront',
          title: 'Customize your storefront',
          description: 'Upload your logo, pick brand colors, and write a short tagline or intro.',
          buttonText: 'Customize Store',
          route: '/settings',
          completed: setupProgress?.tasks['customize_storefront']?.completed || false,
          tooltip: 'This is what customers see first',
          icon: Store,
        },
        {
          id: 'set_store_link',
          title: 'Set your store link',
          description: 'Choose your subdomain (e.g., vendora.store/yourname).',
          buttonText: 'Set Store URL',
          route: '/settings',
          completed: setupProgress?.tasks['set_store_link']?.completed || false,
          tooltip: 'Your unique store address',
          icon: Lightbulb,
        },
      ],
    },
    {
      id: 'store_settings',
      title: 'Store Settings',
      icon: Settings,
      description: 'Configure payments and delivery',
      color: 'blue',
      tasks: [
        {
          id: 'connect_payout_account',
          title: 'Connect payout account',
          description: 'Enter your bank or mobile money details to receive payments.',
          buttonText: 'Connect Account',
          route: '/settings',
          completed: setupProgress?.tasks['connect_payout_account']?.completed || false,
          tooltip: 'Secure payment processing',
          icon: Settings,
        },
        {
          id: 'set_delivery_options',
          title: 'Set shipping/delivery options',
          description: 'Configure delivery zones, flat rates, or free shipping.',
          buttonText: 'Set Delivery',
          route: '/settings',
          completed: setupProgress?.tasks['set_delivery_options']?.completed || false,
          tooltip: 'Customer delivery preferences',
          icon: Settings,
        },
      ],
    },
    {
      id: 'order_messaging',
      title: 'Order & Messaging Setup',
      icon: MessageSquare,
      description: 'Connect communication channels',
      color: 'purple',
      tasks: [
        {
          id: 'set_notification_preference',
          title: 'Choose order notification preference',
          description: 'Select how you\'d like to receive order alerts: WhatsApp, email, or dashboard only.',
          buttonText: 'Set Notification Preference',
          route: '/settings',
          completed: setupProgress?.tasks['set_notification_preference']?.completed || false,
          tooltip: 'Stay updated on new orders',
          icon: MessageSquare,
        },
        {
          id: 'connect_whatsapp',
          title: 'Connect your WhatsApp number',
          description: 'Link your WhatsApp so customers can place orders or reach out.',
          buttonText: 'Connect WhatsApp',
          route: '/settings',
          completed: setupProgress?.tasks['connect_whatsapp']?.completed || false,
          tooltip: 'Direct customer communication',
          icon: MessageSquare,
        },
      ],
    },
    {
      id: 'business_profile',
      title: 'Business Profile',
      icon: Building2,
      description: 'Complete your business information',
      color: 'orange',
      tasks: [
        {
          id: 'add_business_info',
          title: 'Add business information',
          description: 'Input your business name, category, location, and working hours.',
          buttonText: 'Add Business Info',
          route: '/settings',
          completed: setupProgress?.tasks['add_business_info']?.completed || false,
          tooltip: 'Professional business profile',
          icon: Building2,
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: Sliders,
      description: 'Choose your selling method',
      color: 'pink',
      tasks: [
        {
          id: 'choose_selling_method',
          title: 'Choose Selling Method',
          description: 'Do you want to sell via WhatsApp only, Website Storefront only, or both?',
          buttonText: 'Choose Method',
          route: '/settings',
          completed: setupProgress?.tasks['choose_selling_method']?.completed || false,
          tooltip: 'Define your sales channels',
          icon: Sliders,
        },
      ],
    },
    {
      id: 'launch_checklist',
      title: 'Launch Checklist',
      icon: Rocket,
      description: 'Final steps to go live',
      color: 'teal',
      tasks: [
        {
          id: 'preview_store',
          title: 'Preview your store',
          description: 'See how your website store looks on desktop and mobile.',
          buttonText: 'Preview Store',
          action: () => {
            markTaskCompleted('preview_store', 'launch_checklist');
            toast.success('Store preview opened!');
          },
          completed: setupProgress?.tasks['preview_store']?.completed || false,
          tooltip: 'Test your customer experience',
          icon: Rocket,
        },
        {
          id: 'share_store_link',
          title: 'Share your website store link',
          description: 'Send your website store link to friends or customers (share to WhatsApp, Instagram, Facebook).',
          buttonText: 'Share Website',
          action: () => {
            markTaskCompleted('share_store_link', 'launch_checklist');
            toast.success('Store link shared!');
          },
          completed: setupProgress?.tasks['share_store_link']?.completed || false,
          tooltip: 'Spread the word about your store',
          icon: Rocket,
        },
        {
          id: 'launch_store',
          title: 'Mark store as LIVE',
          description: 'You\'re ready to sell. Activate your store now.',
          buttonText: 'Launch Website Store',
          action: () => {
            markTaskCompleted('launch_store', 'launch_checklist');
            toast.success('🎉 Congratulations! Your store is now LIVE!');
          },
          completed: setupProgress?.tasks['launch_store']?.completed || false,
          tooltip: 'Go live and start selling!',
          icon: Rocket,
        },
      ],
    },
  ];

  useEffect(() => {
    // Auto-validate all tasks on mount and periodically
    if (validateAllTasks) {
      validateAllTasks();
      
      // Set up periodic validation every 30 seconds
      const interval = setInterval(() => {
        validateAllTasks();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [validateAllTasks]);

  // Load user store data
  useEffect(() => {
    if (user) {
      loadUserStore();
    }
  }, [user]);

  const loadUserStore = async () => {
    if (!user) return;
    
    try {
      const { data: store, error } = await supabase
        .from('stores')
        .select('*')
        .eq('vendor_id', user.id)
        .single();
      
      if (store && !error) {
        setUserStore(store);
      }
    } catch (error) {
      console.log('No store found');
    }
  };

  // Setup completion detection
  useEffect(() => {
    if (setupProgress?.isSetupCompleted && !showCelebration) {
      setShowCelebration(true);
      onSetupComplete?.();
    }
  }, [setupProgress?.isSetupCompleted, showCelebration, onSetupComplete]);

  // Handle task clicks with smart validation and custom actions
  const handleTaskClick = async (task: any) => {
    const sectionId = sections.find(s => s.tasks.some(t => t.id === task.id))?.id;
    
    // Handle specific task actions
    switch (task.id) {
      case 'add_first_product':
        navigate('/products');
        break;
      
      case 'customize_storefront':
      case 'set_store_link':
      case 'connect_whatsapp':
      case 'add_business_info':
        navigate('/settings');
        break;
      
      case 'connect_payout_account':
        setShowBankAccountForm(true);
        return;
      
      case 'set_delivery_options':
        setShowDeliveryOptionsForm(true);
        return;
      
      case 'set_notification_preference':
        setShowNotificationPreferencesForm(true);
        return;
      
      case 'choose_selling_method':
        setShowSellingMethodForm(true);
        return;
      
      case 'preview_store':
        if (userStore?.slug) {
          window.open(`/store/${userStore.slug}`, '_blank');
          markTaskCompleted('preview_store', 'launch_checklist');
          toast.success('Store preview opened!');
        } else {
          toast.error('Please set your store link first');
        }
        return;
      
      case 'share_store_link':
        if (userStore?.slug) {
          const storeUrl = `${window.location.origin}/store/${userStore.slug}`;
          navigator.clipboard.writeText(storeUrl);
          markTaskCompleted('share_store_link', 'launch_checklist');
          toast.success('Store link copied to clipboard!');
        } else {
          toast.error('Please set your store link first');
        }
        return;
      
      case 'launch_store':
        markTaskCompleted('launch_store', 'launch_checklist');
        toast.success('🎉 Congratulations! Your store is now LIVE!');
        return;
      
      default:
        // Handle custom action if provided
        if (task.action) {
          task.action();
        } else if (task.route) {
          navigate(task.route);
        }
        break;
    }

    // Auto-validate the task after navigation
    if (sectionId && validateAndUpdateTask && task.route) {
      setTimeout(() => {
        validateAndUpdateTask(task.id, sectionId);
      }, 1000);
    }

    // Call optional callback
    onTaskComplete?.();
  };

  // Toggle section visibility
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Handle AI assistance
  const handleAIAssist = () => {
    setShowAIAssist(true);
    // TODO: Add proper event tracking
  };

  // Calculate overall progress
  const getSectionProgress = (sectionId: string) => {
    return setupProgress?.sectionsProgress[sectionId] || 0;
  };

  const overallProgress = setupProgress?.overallProgress || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Setup Completion Celebration */}
        {showCelebration && (
          <SetupCompletionCelebration
            onDismiss={() => {
              setShowCelebration(false);
              onSetupComplete?.();
            }}
            storeName="My Store" // TODO: Get actual store name
            storeSlug="my-store" // TODO: Get actual store slug
          />
        )}

        {/* Header */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-teal-500/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Setup Your Store</CardTitle>
                <p className="text-muted-foreground">Complete these steps to launch your business</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIAssist}
                className="hidden sm:flex items-center gap-2"
              >
                <Bot className="h-4 w-4" />
                AI Smart Start
              </Button>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Setup Progress
                </span>
                <span className="font-medium text-primary">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              {overallProgress === 100 && (
                <div className="text-center text-emerald-600 font-medium">
                  🎉 Congratulations! Your store setup is complete!
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Setup Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const isOpen = openSections[section.id];
            const sectionProgress = getSectionProgress(section.id);
            const completedTasks = section.tasks.filter(task => task.completed).length;
            const totalTasks = section.tasks.length;
            const isCompleted = completedTasks === totalTasks;
            
            // Check if section is required (first 5 sections are required)
            const requiredSections = ['store_setup', 'store_settings', 'order_messaging', 'business_profile', 'preferences'];
            const isRequired = requiredSections.includes(section.id);

            return (
              <Card key={section.id} className="overflow-hidden">
                <Collapsible open={isOpen} onOpenChange={() => toggleSection(section.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${section.color}-100 text-${section.color}-600`}>
                            <section.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{section.title}</h3>
                              {isRequired && (
                                <Badge variant="outline" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              {isCompleted && (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
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
                              {completedTasks}/{totalTasks}
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
                        {section.tasks.map((task) => (
                          <Tooltip key={task.id}>
                            <TooltipTrigger asChild>
                              <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                                task.completed 
                                  ? 'bg-emerald-50 border-emerald-200' 
                                  : 'bg-background border-border hover:border-primary/30'
                              }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    task.completed 
                                      ? 'bg-emerald-100 text-emerald-600' 
                                      : 'bg-accent text-muted-foreground'
                                  }`}>
                                    {task.completed ? (
                                      <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                      <Circle className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{task.title}</h4>
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                  </div>
                                </div>
                                <Button
                                  variant={task.completed ? "secondary" : "default"}
                                  size="sm"
                                  onClick={() => handleTaskClick(task)}
                                  disabled={task.completed}
                                >
                                  {task.completed ? "Completed" : task.buttonText}
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{task.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* AI Assist FAB for mobile */}
        {!showAIAssist && (
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden z-50"
            onClick={handleAIAssist}
          >
            <Bot className="h-6 w-6" />
          </Button>
        )}

        {/* Setup Forms */}
        <BankAccountForm
          open={showBankAccountForm}
          onOpenChange={setShowBankAccountForm}
          onComplete={() => {
            validateAndUpdateTask?.('connect_payout_account', 'store_settings');
            onTaskComplete?.();
          }}
        />

        <DeliveryOptionsForm
          open={showDeliveryOptionsForm}
          onOpenChange={setShowDeliveryOptionsForm}
          onComplete={() => {
            validateAndUpdateTask?.('set_delivery_options', 'store_settings');
            onTaskComplete?.();
          }}
        />

        <NotificationPreferencesForm
          open={showNotificationPreferencesForm}
          onOpenChange={setShowNotificationPreferencesForm}
          onComplete={() => {
            validateAndUpdateTask?.('set_notification_preference', 'order_messaging');
            onTaskComplete?.();
          }}
        />

        <SellingMethodForm
          open={showSellingMethodForm}
          onOpenChange={setShowSellingMethodForm}
          onComplete={() => {
            validateAndUpdateTask?.('choose_selling_method', 'preferences');
            onTaskComplete?.();
          }}
        />
      </div>
    </TooltipProvider>
  );
};

export default SetupWizard;