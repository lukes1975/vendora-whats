import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Share, Package, Megaphone, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RetentionData {
  signup_date: string;
  store_created_at?: string;
  first_product_added_at?: string;
  first_sale_at?: string;
  first_share_at?: string;
  last_active_at: string;
  total_products: number;
  total_orders: number;
}

export const RetentionNudges = () => {
  const { getRetentionData, track } = useAnalytics();
  const { storeData, stats } = useDashboardData();
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [nudge, setNudge] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRetentionData = async () => {
      const data = await getRetentionData();
      if (data) {
        setRetentionData(data);
        determineNudge(data);
      }
    };

    loadRetentionData();
  }, [getRetentionData]);

  const determineNudge = (data: RetentionData) => {
    const now = new Date();
    const signupDate = new Date(data.signup_date);
    const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // 24h nudge: No products added
    if (!data.first_product_added_at && daysSinceSignup >= 1) {
      setNudge('no_products_24h');
      return;
    }

    // 3 days nudge: No store shared
    if (!data.first_share_at && daysSinceSignup >= 3 && data.total_products > 0) {
      setNudge('no_share_3d');
      return;
    }

    // First sale celebration
    if (data.first_sale_at && !localStorage.getItem('first_sale_celebrated')) {
      setNudge('first_sale');
      return;
    }

    // 7 days inactive
    const lastActive = new Date(data.last_active_at);
    const daysSinceActive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceActive >= 7) {
      setNudge('inactive_7d');
      return;
    }

    // Growth nudge: Has products but no recent orders
    if (data.total_products > 0 && data.total_orders === 0 && daysSinceSignup >= 2) {
      setNudge('growth_opportunity');
      return;
    }

    setNudge(null);
  };

  const handleNudgeAction = (action: string) => {
    track('nudge_clicked', { nudge_type: nudge, action });
    
    switch (action) {
      case 'add_product':
        navigate('/products');
        break;
      case 'share_store':
        if (storeData?.slug) {
          const storeUrl = `${window.location.origin}/${storeData.slug}`;
          navigator.clipboard.writeText(storeUrl);
          track('store_shared', { source: 'retention_nudge' });
        }
        break;
      case 'celebrate_sale':
        localStorage.setItem('first_sale_celebrated', 'true');
        setNudge(null);
        break;
      case 'broadcast':
        // Future: Navigate to broadcast feature
        track('broadcast_intent', { source: 'retention_nudge' });
        break;
    }
  };

  const dismissNudge = () => {
    setNudge(null);
    if (nudge) {
      track('nudge_dismissed', { nudge_type: nudge });
    }
  };

  if (!nudge || !retentionData) return null;

  const nudgeConfig = {
    no_products_24h: {
      icon: Package,
      title: "Your store is live but empty",
      description: "Add your first product in 2 minutes and start selling professionally",
      action: "Add Product",
      actionHandler: () => handleNudgeAction('add_product'),
      variant: "default" as const
    },
    no_share_3d: {
      icon: Share,
      title: "3 visitors found your store today",
      description: "Share your store link to reach more customers and grow your business",
      action: "Share Store",
      actionHandler: () => handleNudgeAction('share_store'),
      variant: "default" as const
    },
    first_sale: {
      icon: Target,
      title: "🎉 Congratulations on your first sale!",
      description: "You're officially a Vendora success story. Ready to scale to ₦100k+?",
      action: "Let's Scale",
      actionHandler: () => handleNudgeAction('celebrate_sale'),
      variant: "default" as const
    },
    inactive_7d: {
      icon: Megaphone,
      title: "Your professional store misses you",
      description: "Quick check-in: Your customers are waiting for new products",
      action: "Quick Check-in",
      actionHandler: () => handleNudgeAction('add_product'),
      variant: "destructive" as const
    },
    growth_opportunity: {
      icon: Megaphone,
      title: "Ready to unlock your first sales?",
      description: "Your products look great. Time to broadcast and drive traffic",
      action: "Start Broadcasting",
      actionHandler: () => handleNudgeAction('broadcast'),
      variant: "default" as const
    }
  };

  const config = nudgeConfig[nudge as keyof typeof nudgeConfig];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Alert className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <Icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-foreground">{config.title}</div>
          <div className="text-sm text-muted-foreground mt-1">{config.description}</div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            size="sm"
            variant={config.variant}
            onClick={config.actionHandler}
            className="whitespace-nowrap"
          >
            {config.action}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={dismissNudge}
            className="text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};