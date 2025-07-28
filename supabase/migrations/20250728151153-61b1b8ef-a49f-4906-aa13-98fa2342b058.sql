-- Phase 1: Fix Critical Database Issues

-- Add unique constraint on stores.vendor_id to prevent duplicates
ALTER TABLE public.stores 
ADD CONSTRAINT stores_vendor_id_unique UNIQUE (vendor_id);

-- Add database indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products (vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON public.orders (vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at);
CREATE INDEX IF NOT EXISTS idx_categories_vendor_id ON public.categories (vendor_id);
CREATE INDEX IF NOT EXISTS idx_user_setup_progress_user_id ON public.user_setup_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events (user_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON public.user_metrics (user_id);

-- Create aggregated view for dashboard stats to improve performance
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
  vendor_id,
  (SELECT COUNT(*) FROM public.products WHERE vendor_id = stores.vendor_id) as total_products,
  (SELECT COUNT(*) FROM public.orders WHERE vendor_id = stores.vendor_id) as total_orders,
  (SELECT COALESCE(SUM(total_price), 0) FROM public.orders WHERE vendor_id = stores.vendor_id) as total_revenue
FROM public.stores;