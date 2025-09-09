-- Fix dependencies issue by dropping in correct order

-- 1. Drop materialized view first (which depends on the view)
DROP MATERIALIZED VIEW IF EXISTS public.vendor_analytics_summary CASCADE;

-- 2. Now drop the view
DROP VIEW IF EXISTS public.unified_orders CASCADE;

-- 3. Create private schema
CREATE SCHEMA IF NOT EXISTS private;

-- 4. Create secure function to replace the view
CREATE OR REPLACE FUNCTION public.get_unified_orders(vendor_id_param UUID)
RETURNS TABLE(
  id UUID,
  vendor_id UUID,
  store_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  total_amount INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  source_table TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to access their own orders
  IF vendor_id_param != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You can only view your own orders';
  END IF;
  
  RETURN QUERY
  SELECT 
    o.id,
    o.vendor_id,
    COALESCE(o.store_id, (SELECT s.id FROM stores s WHERE s.vendor_id = o.vendor_id LIMIT 1)) as store_id,
    o.customer_name,
    o.customer_phone,
    COALESCE(o.customer_email, '') as customer_email,
    COALESCE(o.total_price::INTEGER, 0) as total_amount,
    o.status,
    o.created_at,
    o.updated_at,
    'orders_v1' as source_table
  FROM public.orders o
  WHERE o.vendor_id = vendor_id_param

  UNION ALL

  SELECT 
    o2.id,
    o2.vendor_id,
    o2.store_id,
    o2.customer_name,
    o2.customer_phone,
    '' as customer_email,
    COALESCE(o2."total", 0) as total_amount,
    o2.status,
    o2.created_at,
    o2.updated_at,
    'orders_v2' as source_table
  FROM public.orders_v2 o2
  WHERE o2.vendor_id = vendor_id_param;
END;
$$;

-- 5. Create secure materialized view in private schema
CREATE MATERIALIZED VIEW private.vendor_analytics_summary AS
SELECT 
  combined_orders.vendor_id,
  COUNT(*) as total_orders,
  SUM(combined_orders.total_amount) as total_revenue,
  AVG(combined_orders.total_amount) as avg_order_value,
  COUNT(*) FILTER (WHERE combined_orders.created_at >= CURRENT_DATE - INTERVAL '30 days') as orders_last_30d,
  SUM(combined_orders.total_amount) FILTER (WHERE combined_orders.created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_last_30d,
  COUNT(*) FILTER (WHERE combined_orders.created_at >= CURRENT_DATE - INTERVAL '7 days') as orders_last_7d,
  SUM(combined_orders.total_amount) FILTER (WHERE combined_orders.created_at >= CURRENT_DATE - INTERVAL '7 days') as revenue_last_7d,
  MAX(combined_orders.created_at) as last_order_date
FROM (
  SELECT 
    vendor_id, 
    COALESCE(total_price::INTEGER, 0) as total_amount,
    created_at,
    status
  FROM public.orders
  WHERE status != 'cancelled'
  
  UNION ALL  
  
  SELECT 
    vendor_id, 
    COALESCE("total", 0) as total_amount,
    created_at,
    status
  FROM public.orders_v2
  WHERE status != 'cancelled'
) AS combined_orders
GROUP BY combined_orders.vendor_id;

-- 6. Create unique index for refresh
CREATE UNIQUE INDEX vendor_analytics_summary_vendor_id_idx 
ON private.vendor_analytics_summary (vendor_id);

-- 7. Update the analytics function
CREATE OR REPLACE FUNCTION public.get_vendor_analytics(vendor_id_param UUID)
RETURNS TABLE(
  vendor_id UUID,
  total_orders BIGINT,
  total_revenue NUMERIC,
  avg_order_value NUMERIC,
  orders_last_30d BIGINT,
  revenue_last_30d NUMERIC,
  orders_last_7d BIGINT,
  revenue_last_7d NUMERIC,
  last_order_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
  -- Only allow users to access their own analytics
  IF vendor_id_param != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: You can only view your own analytics';
  END IF;
  
  RETURN QUERY
  SELECT 
    vas.vendor_id,
    vas.total_orders,
    vas.total_revenue,
    vas.avg_order_value,
    vas.orders_last_30d,
    vas.revenue_last_30d,
    vas.orders_last_7d,
    vas.revenue_last_7d,
    vas.last_order_date
  FROM private.vendor_analytics_summary vas
  WHERE vas.vendor_id = vendor_id_param;
END;
$$;

-- 8. Update refresh function
CREATE OR REPLACE FUNCTION public.refresh_vendor_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.vendor_analytics_summary;
END;
$$;

-- 9. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_unified_orders(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_vendor_analytics(UUID) TO authenticated;