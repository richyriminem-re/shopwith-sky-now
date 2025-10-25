-- Insert default site settings for home page configuration
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
  ('site_logo_url', '/lovable-uploads/e056f700-4487-46d1-967e-39e0eb41e922.png'),
  ('call_bar_phone', '+234 905 777 5190'),
  ('footer_company_name', 'Shop With Sky'),
  ('footer_company_description', 'Your one-stop destination for quality fashion and lifestyle products. Shop with confidence and style.'),
  ('footer_phone', '+234 905 777 5190'),
  ('footer_email', 'support@shopwithsky.com'),
  ('footer_address', 'Lagos, Nigeria'),
  ('footer_whatsapp_group', 'https://chat.whatsapp.com/your-group-link'),
  ('footer_whatsapp_contact', 'https://wa.me/2349057775190'),
  ('footer_instagram', 'https://instagram.com/shopwithsky'),
  ('footer_tiktok', 'https://tiktok.com/@shopwithsky'),
  ('footer_copyright_text', 'Shop With Sky. All rights reserved.')
ON CONFLICT (setting_key) DO NOTHING;