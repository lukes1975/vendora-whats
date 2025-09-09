-- Fix remaining security issues

-- 1. Remove the security definer view and replace with a secure function
DROP VIEW IF EXISTS public.unified_orders;

-- Create a secure function instead of a view
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_unified_orders(UUID) TO authenticated;

-- 2. Make materialized view completely private (no API access)
-- Remove from public schema and create in a private schema
CREATE SCHEMA IF NOT EXISTS private;

-- Drop existing materialized view
DROP MATERIALIZED VIEW IF EXISTS public.vendor_analytics_summary;

-- Create it in private schema
CREATE MATERIALIZED VIEW private.vendor_analytics_summary AS
SELECT 
  o.vendor_id,
  COUNT(*) as total_orders,
  SUM(COALESCE(o.total_price::INTEGER, o2.total, 0)) as total_revenue,
  AVG(COALESCE(o.total_price::INTEGER, o2.total, 0)) as avg_order_value,
  COUNT(*) FILTER (WHERE COALESCE(o.created_at, o2.created_at) >= CURRENT_DATE - INTERVAL '30 days') as orders_last_30d,
  SUM(COALESCE(o.total_price::INTEGER, o2.total, 0)) FILTER (WHERE COALESCE(o.created_at, o2.created_at) >= CURRENT_DATE - INTERVAL '30 days') as revenue_last_30d,
  COUNT(*) FILTER (WHERE COALESCE(o.created_at, o2.created_at) >= CURRENT_DATE - INTERVAL '7 days') as orders_last_7d,
  SUM(COALESCE(o.total_price::INTEGER, o2.total, 0)) FILTER (WHERE COALESCE(o.created_at, o2.created_at) >= CURRENT_DATE - INTERVAL '7 days') as revenue_last_7d,
  MAX(COALESCE(o.created_at, o2.created_at)) as last_order_date
FROM (
  SELECT vendor_id, total_price, created_at, status FROM public.orders
  UNION ALL  
  SELECT vendor_id, total, created_at, status FROM public.orders_v2
) AS combined_orders(vendor_id, total_price, created_at, status)
LEFT JOIN public.orders o ON combined_orders.vendor_id = o.vendor_id AND combined_orders.created_at = o.created_at
LEFT JOIN public.orders_v2 o2 ON combined_orders.vendor_id = o2.vendor_id AND combined_orders.created_at = o2.created_at
WHERE combined_orders.status != 'cancelled'
GROUP BY combined_orders.vendor_id;

-- Create unique index for refresh
CREATE UNIQUE INDEX IF NOT EXISTS vendor_analytics_summary_vendor_id_idx 
ON private.vendor_analytics_summary (vendor_id);

-- Update the analytics function to use private schema
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

-- Update refresh function to use private schema
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