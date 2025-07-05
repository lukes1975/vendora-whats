
-- Create the product-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create policy for authenticated users to upload their own images
CREATE POLICY "Users can upload their own product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to view their own images
CREATE POLICY "Users can view their own product images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to update their own images
CREATE POLICY "Users can update their own product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to delete their own images
CREATE POLICY "Users can delete their own product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for products table
ALTER TABLE products REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
