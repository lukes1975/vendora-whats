
-- 1) Store settings
CREATE TABLE IF NOT EXISTS public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  base_location_lat double precision,
  base_location_lng double precision,
  delivery_pricing jsonb NOT NULL DEFAULT '{}'::jsonb,
  google_maps_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id)
);
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings for active stores (non-sensitive)
CREATE POLICY "Public can view settings for active stores"
  ON public.store_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = store_settings.store_id AND s.is_active = true
    )
  );

-- Vendors manage their own settings
CREATE POLICY "Vendors manage their store settings"
  ON public.store_settings
  FOR ALL
  USING (auth.uid() = vendor_id)
  WITH CHECK (auth.uid() = vendor_id);

CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_store_settings_vendor_id ON public.store_settings(vendor_id);

-- 2) Orders (cart-based)
CREATE TABLE IF NOT EXISTS public.orders_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  subtotal integer NOT NULL DEFAULT 0,
  delivery_fee integer NOT NULL DEFAULT 0,
  service_fee integer NOT NULL DEFAULT 0,
  surge_multiplier numeric NOT NULL DEFAULT 1.0,
  total integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  status text NOT NULL DEFAULT 'pending_payment',
  payment_method text,
  whatsapp_message text,
  eta_minutes integer,
  distance_km numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders_v2 ENABLE ROW LEVEL SECURITY;

-- Vendors manage their own orders
CREATE POLICY "Vendors manage their orders_v2"
  ON public.orders_v2
  FOR ALL
  USING (auth.uid() = vendor_id)
  WITH CHECK (auth.uid() = vendor_id);

CREATE TRIGGER update_orders_v2_updated_at
BEFORE UPDATE ON public.orders_v2
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_orders_v2_vendor_created ON public.orders_v2(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_v2_store ON public.orders_v2(store_id);

-- 3) Order items
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders_v2(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  name text NOT NULL,
  unit_price integer NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Vendors manage their own order_items (through order ownership)
CREATE POLICY "Vendors manage their order_items"
  ON public.order_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.orders_v2 o
      WHERE o.id = order_items.order_id AND o.vendor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders_v2 o
      WHERE o.id = order_items.order_id AND o.vendor_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 4) Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders_v2(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'paystack' | 'bank_transfer'
  reference text,
  status text NOT NULL DEFAULT 'pending',
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  received_at timestamptz,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Vendors can view and manage payments for their orders
CREATE POLICY "Vendors manage their payments"
  ON public.payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.orders_v2 o
      WHERE o.id = payments.order_id AND o.vendor_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders_v2 o
      WHERE o.id = payments.order_id AND o.vendor_id = auth.uid()
    )
  );

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- 5) Riders
CREATE TABLE IF NOT EXISTS public.riders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  vehicle_type text NOT NULL DEFAULT 'bike',
  status text NOT NULL DEFAULT 'inactive', -- 'inactive' | 'active' | 'offshift'
  current_lat double precision,
  current_lng double precision,
  rating numeric DEFAULT 5.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors manage their riders"
  ON public.riders
  FOR ALL
  USING (auth.uid() = vendor_id)
  WITH CHECK (auth.uid() = vendor_id);

CREATE TRIGGER update_riders_updated_at
BEFORE UPDATE ON public.riders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_riders_vendor_id ON public.riders(vendor_id);

-- 6) Rider assignments
CREATE TABLE IF NOT EXISTS public.rider_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders_v2(id) ON DELETE CASCADE,
  rider_id uuid REFERENCES public.riders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'offered', -- 'offered' | 'accepted' | 'declined' | 'expired' | 'completed' | 'cancelled'
  assigned_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  eta_minutes integer,
  live_location_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rider_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors manage their rider assignments"
  ON public.rider_assignments
  FOR ALL
  USING (auth.uid() = vendor_id)
  WITH CHECK (auth.uid() = vendor_id);

CREATE TRIGGER update_rider_assignments_updated_at
BEFORE UPDATE ON public.rider_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_rider_assignments_order_id ON public.rider_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_rider_assignments_vendor_id ON public.rider_assignments(vendor_id);

-- 7) WhatsApp messages (transcripts)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders_v2(id) ON DELETE SET NULL,
  direction text NOT NULL, -- 'incoming' | 'outgoing'
  from_number text NOT NULL,
  to_number text NOT NULL,
  message text,
  media_url text,
  status text DEFAULT 'received', -- 'received' | 'sent' | 'failed'
  session_id text,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors view their whatsapp messages"
  ON public.whatsapp_messages
  FOR SELECT
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors insert their whatsapp messages"
  ON public.whatsapp_messages
  FOR INSERT
  WITH CHECK (auth.uid() = vendor_id);

-- Service role will bypass RLS for webhook ingestion
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_vendor_ts ON public.whatsapp_messages(vendor_id, "timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_order_id ON public.whatsapp_messages(order_id);
