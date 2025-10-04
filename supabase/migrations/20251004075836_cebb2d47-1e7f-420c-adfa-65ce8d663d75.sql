-- Create hero_slides table
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  webp_url text,
  alt_text text,
  link_url text,
  link_text text,
  link_target text DEFAULT '_self',
  cta_position text,
  cta_size text DEFAULT 'default',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Allow public to read active slides
CREATE POLICY "Public can read active hero slides"
ON public.hero_slides
FOR SELECT
USING (is_active = true);

-- Allow admins to manage all slides
CREATE POLICY "Admins can manage hero slides"
ON public.hero_slides
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();