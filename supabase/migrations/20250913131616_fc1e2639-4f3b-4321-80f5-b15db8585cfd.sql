-- Fix vendor analytics materialized view type mismatches
-- This resolves the "structure of query does not match function result type" error

-- Drop and recreate the materialized view with proper type casting
DROP MATERIALIZED VIEW IF EXISTS private.vendor_analytics_summary;

CREATE MATERIALIZED VIEW private.vendor_analytics_summary AS
SELECT 
    vendor_id,
    COUNT(*)::bigint as total_orders,
    COALESCE(SUM(total_amount)::numeric, 0) as total_revenue,
    COALESCE(AVG(total_amount)::numeric, 0) as avg_order_value,
    COUNT(CASE WHEN created_at > now() - interval '30 days' THEN 1 END)::bigint as orders_last_30d,
    COALESCE(SUM(CASE WHEN created_at > now() - interval '30 days' THEN total_amount ELSE 0 END)::numeric, 0) as revenue_last_30d,
    COUNT(CASE WHEN created_at > now() - interval '7 days' THEN 1 END)::bigint as orders_last_7d,
    COALESCE(SUM(CASE WHEN created_at > now() - interval '7 days' THEN total_amount ELSE 0 END)::numeric, 0) as revenue_last_7d,
    MAX(created_at) as last_order_date
FROM (
    -- Orders from orders table (legacy)
    SELECT 
        vendor_id,
        total_price::integer as total_amount,
        created_at
    FROM public.orders
    WHERE status != 'cancelled'
    
    UNION ALL
    
    -- Orders from orders_v2 table (new)
    SELECT 
        vendor_id,
        total as total_amount,
        created_at
    FROM public.orders_v2
    WHERE status != 'cancelled'
) unified_orders
GROUP BY vendor_id;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS vendor_analytics_summary_vendor_id_idx 
ON private.vendor_analytics_summary (vendor_id);

-- Refresh the materialized view with data
REFRESH MATERIALIZED VIEW private.vendor_analytics_summary;