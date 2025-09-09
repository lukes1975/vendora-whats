-- Fix security warnings from the linter

-- 1. Fix function search paths by setting them properly
CREATE OR REPLACE FUNCTION public.refresh_vendor_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vendor_analytics_summary;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_order_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.log_performance_metric(
  metric_type_param TEXT,
  metric_value_param NUMERIC,
  tags_param JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.performance_metrics (metric_type, metric_value, tags)
  VALUES (metric_type_param, metric_value_param, tags_param);
END;
$$;

-- 2. Revoke public access to materialized view and only allow specific access
REVOKE ALL ON public.vendor_analytics_summary FROM PUBLIC;
REVOKE ALL ON public.vendor_analytics_summary FROM authenticated;

-- Grant only specific access to authenticated users for their own data
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
SET search_path = public
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
  FROM public.vendor_analytics_summary vas
  WHERE vas.vendor_id = vendor_id_param;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_vendor_analytics(UUID) TO authenticated;