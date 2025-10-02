-- Add SEO and active status fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.products.seo_title IS 'SEO-optimized title for search engines (max 60 chars recommended)';
COMMENT ON COLUMN public.products.seo_description IS 'SEO-optimized description for search engines (max 160 chars recommended)';
COMMENT ON COLUMN public.products.is_active IS 'Whether the product is active and visible to customers';