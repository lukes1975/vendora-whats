-- Create university marketplaces table
CREATE TABLE public.university_marketplaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL, -- e.g., 'fuoye', 'unilag'
  description text,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.university_marketplaces ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view active university marketplaces"
ON public.university_marketplaces
FOR SELECT
USING (is_active = true);

-- Insert FUOYE marketplace
INSERT INTO public.university_marketplaces (name, code, description)
VALUES ('Federal University Oye-Ekiti', 'fuoye', 'Official FUOYE University Marketplace');

-- Create student verification table
CREATE TABLE public.student_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  university_id uuid REFERENCES university_marketplaces(id),
  student_id text NOT NULL,
  department text,
  graduation_year integer,
  verification_status text CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(university_id, student_id)
);

-- Enable RLS
ALTER TABLE public.student_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own verification"
ON public.student_verifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own verification"
ON public.student_verifications
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create marketplace categories
CREATE TABLE public.marketplace_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES university_marketplaces(id),
  name text NOT NULL,
  description text,
  icon text, -- lucide icon name
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view active marketplace categories"
ON public.marketplace_categories
FOR SELECT
USING (is_active = true);

-- Insert FUOYE marketplace categories
INSERT INTO public.marketplace_categories (university_id, name, description, icon, sort_order) VALUES
((SELECT id FROM university_marketplaces WHERE code = 'fuoye'), 'Textbooks', 'Academic books and study materials', 'Book', 1),
((SELECT id FROM university_marketplaces WHERE code = 'fuoye'), 'Electronics', 'Phones, laptops, gadgets', 'Smartphone', 2),
((SELECT id FROM university_marketplaces WHERE code = 'fuoye'), 'Fashion', 'Clothes, shoes, accessories', 'Shirt', 3),
((SELECT id FROM university_marketplaces WHERE code = 'fuoye'), 'Food & Snacks', 'Food items and snacks', 'Coffee', 4),
((SELECT id FROM university_marketplaces WHERE code = 'fuoye'), 'Services', 'Tutoring, repairs, deliveries', 'Users', 5),
((SELECT id FROM university_marketplaces WHERE code = 'fuoye'), 'Stationery', 'Pens, notebooks, supplies', 'PenTool', 6),
((SELECT id FROM university_marketplaces WHERE code = 'fuoye'), 'Accommodation', 'Hostel items, furniture', 'Home', 7),
((SELECT id FROM university_marketplaces WHERE code = 'fuoye'), 'Sports & Recreation', 'Sports equipment, games', 'Trophy', 8);

-- Create product ratings table
CREATE TABLE public.product_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Enable RLS
ALTER TABLE public.product_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view product ratings"
ON public.product_ratings
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create ratings"
ON public.product_ratings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
ON public.product_ratings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create vendor ratings table
CREATE TABLE public.vendor_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  order_id uuid, -- Optional reference to specific order
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vendor_id, customer_id, order_id)
);

-- Enable RLS
ALTER TABLE public.vendor_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view vendor ratings"
ON public.vendor_ratings
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create vendor ratings"
ON public.vendor_ratings
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Add university marketplace support to existing tables
ALTER TABLE public.products 
ADD COLUMN university_marketplace_id uuid REFERENCES university_marketplaces(id),
ADD COLUMN marketplace_category_id uuid REFERENCES marketplace_categories(id);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_university_marketplaces_updated_at
  BEFORE UPDATE ON public.university_marketplaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_verifications_updated_at
  BEFORE UPDATE ON public.student_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_categories_updated_at
  BEFORE UPDATE ON public.marketplace_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_ratings_updated_at
  BEFORE UPDATE ON public.product_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_ratings_updated_at
  BEFORE UPDATE ON public.vendor_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();