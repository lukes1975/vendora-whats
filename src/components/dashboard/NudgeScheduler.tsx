import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NudgeSchedulerProps {
  onNudgeShow?: (message: string) => void;
}

const MOTIVATIONAL_NUDGES = [
  {
    timeHours: 24,
    message: "🎯 Your first customer is just around the corner. Keep building!",
    type: "24h"
  },
  {
    timeHours: 48, 
    message: "💪 48 hours in - You're already ahead of those who never started.",
    type: "48h"
  },
  {
    timeHours: 72,
    message: "🚀 3 days strong! Great businesses are built one day at a time.",
    type: "72h"
  },
  {
    timeHours: 168, // 7 days
    message: "🌟 One week milestone! You're 1 step away from greatness.",
    type: "7d"
  }
];

const NudgeScheduler = ({ onNudgeShow }: NudgeSchedulerProps) => {
  const { user } = useAuth();

  // Get user metrics to determine signup date
  const { data: userMetrics } = useQuery({
    queryKey: ['user-metrics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_metrics')
        .select('signup_date, created_at')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user metrics:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Check if user has received nudges (using localStorage for lightweight tracking)
  const checkAndShowNudges = () => {
    if (!userMetrics || !user) return;

    const signupDate = new Date(userMetrics.signup_date || userMetrics.created_at);
    const now = new Date();
    const hoursSinceSignup = (now.getTime() - signupDate.getTime()) / (1000 * 60 * 60);

    const nudgeKey = `nudges_${user.id}`;
    const shownNudges = JSON.parse(localStorage.getItem(nudgeKey) || '[]');

    for (const nudge of MOTIVATIONAL_NUDGES) {
      // Check if enough time has passed and nudge hasn't been shown
      if (hoursSinceSignup >= nudge.timeHours && !shownNudges.includes(nudge.type)) {
        // Show the nudge
        toast(nudge.message, {
          duration: 8000,
          position: 'top-center',
        });

        // Mark as shown
        const updatedNudges = [...shownNudges, nudge.type];
        localStorage.setItem(nudgeKey, JSON.stringify(updatedNudges));

        // Call optional callback
        onNudgeShow?.(nudge.message);
        
        // Only show one nudge at a time
        break;
      }
    }
  };

  useEffect(() => {
    if (!userMetrics || !user) return;

    // Check immediately
    checkAndShowNudges();

    // Set up periodic check (every hour)
    const interval = setInterval(checkAndShowNudges, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userMetrics, user]);

  // This component doesn't render anything visible
  return null;
};

export default NudgeScheduler;