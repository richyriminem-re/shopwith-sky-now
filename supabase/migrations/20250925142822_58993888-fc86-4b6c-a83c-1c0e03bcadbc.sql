-- Create categories table for product organization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  description TEXT,
  primary_category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  brand TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product variants table
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  color TEXT,
  size TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product images table
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access only
CREATE POLICY "Admin users can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can manage product variants" ON public.product_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can manage product images" ON public.product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can manage admin users" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Public read access for products on frontend
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can read product variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public can read product images" ON public.product_images FOR SELECT USING (true);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Create storage policies for product images
CREATE POLICY "Admin can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_products_primary_category ON public.products(primary_category);
CREATE INDEX idx_products_subcategory ON public.products(subcategory);
CREATE INDEX idx_products_handle ON public.products(handle);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_sort_order ON public.product_images(sort_order);
CREATE INDEX idx_admin_users_user_id ON public.admin_users(user_id);