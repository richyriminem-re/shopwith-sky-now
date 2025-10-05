-- Create shipping_methods table
CREATE TABLE public.shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cost numeric NOT NULL CHECK (cost >= 0),
  estimated_delivery text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'shipping')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  description text,
  min_order_amount numeric CHECK (min_order_amount >= 0),
  max_discount numeric CHECK (max_discount >= 0),
  expiry_date timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  usage_limit integer,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create site_settings table
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shipping_methods
CREATE POLICY "Public can read active shipping methods"
ON public.shipping_methods FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage shipping methods"
ON public.shipping_methods FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for promo_codes
CREATE POLICY "Public can read active promo codes"
ON public.promo_codes FOR SELECT
USING (is_active = true AND (expiry_date IS NULL OR expiry_date > now()));

CREATE POLICY "Admins can manage promo codes"
ON public.promo_codes FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for site_settings
CREATE POLICY "Public can read site settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage site settings"
ON public.site_settings FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default shipping methods
INSERT INTO public.shipping_methods (name, cost, estimated_delivery, display_order) VALUES
('Standard Shipping', 5000, '5-7 business days', 1),
('Express Shipping', 10000, '2-3 business days', 2);

-- Insert default promo codes
INSERT INTO public.promo_codes (code, discount_type, discount_value, description, max_discount) VALUES
('WELCOME10', 'percentage', 10, '10% off your order', 50000),
('FREESHIP', 'shipping', 100, 'Free shipping', NULL),
('SAVE20', 'percentage', 20, '20% off your order', 100000);

-- Insert default free shipping threshold
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('free_shipping_threshold', '100000');

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_shipping_methods_updated_at
BEFORE UPDATE ON public.shipping_methods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();