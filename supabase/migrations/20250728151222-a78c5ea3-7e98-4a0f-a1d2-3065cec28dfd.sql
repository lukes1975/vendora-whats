-- Clean up duplicate stores first, keeping the most recent one for each vendor
WITH ranked_stores AS (
  SELECT id, vendor_id, 
         ROW_NUMBER() OVER (PARTITION BY vendor_id ORDER BY created_at DESC) as rn
  FROM public.stores
)
DELETE FROM public.stores 
WHERE id IN (
  SELECT id FROM ranked_stores WHERE rn > 1
);

-- Now add the unique constraint
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