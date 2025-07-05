
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('vendor', 'admin');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'vendor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create stores table for vendor storefronts
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  whatsapp_number TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  slug TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  views INTEGER DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Stores policies
CREATE POLICY "Vendors can manage their own stores" ON public.stores
  FOR ALL USING (auth.uid() = vendor_id);

CREATE POLICY "Anyone can view active stores" ON public.stores
  FOR SELECT USING (is_active = true);

-- Products policies
CREATE POLICY "Vendors can manage their own products" ON public.products
  FOR ALL USING (auth.uid() = vendor_id);

CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = products.store_id 
    AND stores.is_active = true
  ));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
