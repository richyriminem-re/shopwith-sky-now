-- Add new site settings for watermarks and logos
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('watermark_image_url', '/lovable-uploads/e056f700-4487-46d1-967e-39e0eb41e922.png'),
  ('receipt_logo_url', '/lovable-uploads/e056f700-4487-46d1-967e-39e0eb41e922.png'),
  ('checkout_logo_url', '/lovable-uploads/e056f700-4487-46d1-967e-39e0eb41e922.png')
ON CONFLICT (setting_key) DO NOTHING;