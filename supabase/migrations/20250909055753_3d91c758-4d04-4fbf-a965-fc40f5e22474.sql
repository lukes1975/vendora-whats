-- Phase 1: Database consolidation and security hardening

-- 1. Create a comprehensive audit log system
CREATE TABLE IF NOT EXISTS public.system_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action_type TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.system_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins view audit logs" ON public.system_audit_log
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- System can insert audit logs
CREATE POLICY "System inserts audit logs" ON public.system_audit_log
FOR INSERT TO service_role
WITH CHECK (true);

-- 2. Create performance monitoring table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  tags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on performance metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Only admins can view performance metrics
CREATE POLICY "Admins view performance metrics" ON public.performance_metrics
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 3. Create a unified orders view that consolidates orders and orders_v2
CREATE OR REPLACE VIEW public.unified_orders AS
SELECT 
  id,
  vendor_id,
  COALESCE(store_id, (SELECT id FROM stores WHERE vendor_id = o.vendor_id LIMIT 1)) as store_id,
  customer_name,
  customer_phone,
  COALESCE(customer_email, '') as customer_email,
  COALESCE(total_price::INTEGER, total) as total_amount,
  status,
  created_at,
  updated_at,
  'orders_v1' as source_table
FROM public.orders o

UNION ALL

SELECT 
  id,
  vendor_id,
  store_id,
  customer_name,
  customer_phone,
  '' as customer_email,
  total as total_amount,
  status,
  created_at,
  updated_at,
  'orders_v2' as source_table
FROM public.orders_v2;

-- 4. Create enhanced analytics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vendor_analytics_summary AS
SELECT 
  vendor_id,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as orders_last_30d,
  SUM(total_amount) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_last_30d,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as orders_last_7d,
  SUM(total_amount) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as revenue_last_7d,
  MAX(created_at) as last_order_date
FROM public.unified_orders
WHERE status != 'cancelled'
GROUP BY vendor_id;

-- Create unique index for refresh
CREATE UNIQUE INDEX IF NOT EXISTS vendor_analytics_summary_vendor_id_idx 
ON public.vendor_analytics_summary (vendor_id);

-- 5. Function to refresh analytics
CREATE OR REPLACE FUNCTION public.refresh_vendor_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vendor_analytics_summary;
END;
$$;

-- 6. Create real-time notifications function
CREATE OR REPLACE FUNCTION public.notify_order_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM pg_notify(
    'order_change',
    json_build_object(
      'operation', TG_OP,
      'vendor_id', COALESCE(NEW.vendor_id, OLD.vendor_id),
      'order_id', COALESCE(NEW.id, OLD.id),
      'status', COALESCE(NEW.status, OLD.status)
    )::text
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 7. Create triggers for real-time updates
DROP TRIGGER IF EXISTS order_change_notify ON public.orders;
CREATE TRIGGER order_change_notify
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_change();

DROP TRIGGER IF EXISTS order_v2_change_notify ON public.orders_v2;
CREATE TRIGGER order_v2_change_notify
  AFTER INSERT OR UPDATE OR DELETE ON public.orders_v2
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_change();

-- 8. Enhanced security policies for orders_v2
DROP POLICY IF EXISTS "Enhanced vendor orders access" ON public.orders_v2;
CREATE POLICY "Enhanced vendor orders access" ON public.orders_v2
FOR ALL TO authenticated
USING (
  vendor_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.id IS NOT NULL
  )
)
WITH CHECK (
  vendor_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.id IS NOT NULL
  )
);

-- 9. Create function to log performance metrics
CREATE OR REPLACE FUNCTION public.log_performance_metric(
  metric_type_param TEXT,
  metric_value_param NUMERIC,
  tags_param JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.performance_metrics (metric_type, metric_value, tags)
  VALUES (metric_type_param, metric_value_param, tags_param);
END;
$$;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_vendor_created_at ON public.orders (vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_v2_vendor_created_at ON public.orders_v2 (vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_vendor_status ON public.products (vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_stores_vendor_active ON public.stores (vendor_id, is_active);

-- 11. Grant necessary permissions
GRANT SELECT ON public.unified_orders TO authenticated;
GRANT SELECT ON public.vendor_analytics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_vendor_analytics() TO authenticated;