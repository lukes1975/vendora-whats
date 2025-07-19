
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type EventType = 
  | 'signup'
  | 'store_created'
  | 'first_product_added'
  | 'store_shared'
  | 'first_order_received'
  | 'whatsapp_shared'
  | 'returned_day_7'
  | 'referral_signup'
  | 'product_added'
  | 'store_viewed'
  | 'guide_completed'
  | 'broadcast_sent'
  | 'dashboard_viewed'
  | 'nudge_clicked'
  | 'nudge_dismissed'
  | 'qr_generated'
  | 'broadcast_intent';

interface EventData {
  [key: string]: any;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const track = useCallback(async (eventType: EventType, eventData: EventData = {}) => {
    if (!user) return;

    try {
      const sessionId = sessionStorage.getItem('session_id') || 
        Math.random().toString(36).substring(2, 15);
      
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId);
      }

      await supabase
        .from('user_events')
        .insert({
          user_id: user.id,
          event_type: eventType,
          event_data: eventData,
          session_id: sessionId
        });

      // Update user metrics for specific events
      await updateUserMetrics(eventType, eventData);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [user]);

  const updateUserMetrics = useCallback(async (eventType: EventType, eventData: EventData) => {
    if (!user) return;

    const updates: any = { last_active_at: new Date().toISOString() };

    switch (eventType) {
      case 'store_created':
        updates.store_created_at = new Date().toISOString();
        break;
      case 'first_product_added':
        updates.first_product_added_at = new Date().toISOString();
        break;
      case 'first_order_received':
        updates.first_sale_at = new Date().toISOString();
        break;
      case 'store_shared':
        if (!updates.first_share_at) {
          updates.first_share_at = new Date().toISOString();
        }
        break;
      case 'product_added':
        // Increment total products
        const { data: currentMetrics } = await supabase
          .from('user_metrics')
          .select('total_products')
          .eq('user_id', user.id)
          .single();
        
        if (currentMetrics) {
          updates.total_products = (currentMetrics.total_products || 0) + 1;
        }
        break;
    }

    if (Object.keys(updates).length > 1) { // More than just last_active_at
      await supabase
        .from('user_metrics')
        .upsert({
          user_id: user.id,
          ...updates
        });
    }
  }, [user]);

  const getRetentionData = useCallback(async () => {
    if (!user) return null;

    const { data } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return data;
  }, [user]);

  const getUserEvents = useCallback(async (eventType?: EventType) => {
    if (!user) return [];

    let query = supabase
      .from('user_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data } = await query.limit(100);
    return data || [];
  }, [user]);

  return {
    track,
    getRetentionData,
    getUserEvents
  };
};
