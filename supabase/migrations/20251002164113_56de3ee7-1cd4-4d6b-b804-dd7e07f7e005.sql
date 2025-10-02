-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can manage products" ON public.products;
DROP POLICY IF EXISTS "Admin users can manage product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admin users can manage product images" ON public.product_images;
DROP POLICY IF EXISTS "Admin users can manage categories" ON public.categories;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = $1
  )
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Admin users can manage admin users"
ON public.admin_users
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin users can manage products"
ON public.products
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin users can manage product variants"
ON public.product_variants
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin users can manage product images"
ON public.product_images
FOR ALL
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin users can manage categories"
ON public.categories
FOR ALL
USING (public.is_admin(auth.uid()));