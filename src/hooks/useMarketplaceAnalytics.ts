import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsEvent {
  productId: string;
  vendorId: string;
  eventType: 'view' | 'whatsapp_click' | 'store_visit' | 'wishlist_add';
  metadata?: Record<string, any>;
}

export const useMarketplaceAnalytics = () => {
  const { toast } = useToast();

  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      const sessionId = localStorage.getItem('marketplace_session_id') || 
        crypto.randomUUID();
      
      if (!localStorage.getItem('marketplace_session_id')) {
        localStorage.setItem('marketplace_session_id', sessionId);
      }

      await supabase.from('product_analytics').insert({
        product_id: event.productId,
        vendor_id: event.vendorId,
        event_type: event.eventType,
        user_session_id: sessionId,
        metadata: event.metadata || {}
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }, []);

  const trackProductView = useCallback(async (productId: string, vendorId: string) => {
    await trackEvent({
      productId,
      vendorId,
      eventType: 'view'
    });
  }, [trackEvent]);

  const trackWhatsAppClick = useCallback(async (productId: string, vendorId: string) => {
    await trackEvent({
      productId,
      vendorId,
      eventType: 'whatsapp_click'
    });
  }, [trackEvent]);

  const trackStoreVisit = useCallback(async (productId: string, vendorId: string) => {
    await trackEvent({
      productId,
      vendorId,
      eventType: 'store_visit'
    });
  }, [trackEvent]);

  const trackWishlistAdd = useCallback(async (productId: string, vendorId: string) => {
    await trackEvent({
      productId,
      vendorId,
      eventType: 'wishlist_add'
    });
  }, [trackEvent]);

  return {
    trackProductView,
    trackWhatsAppClick,
    trackStoreVisit,
    trackWishlistAdd
  };
};