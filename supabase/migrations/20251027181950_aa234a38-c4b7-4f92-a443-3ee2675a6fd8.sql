-- Create FAQs table
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read active FAQs" 
ON public.faqs 
FOR SELECT 
USING (is_active = true);

-- Create policies for admin management
CREATE POLICY "Admins can manage FAQs" 
ON public.faqs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_faqs_updated_at
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default FAQs
INSERT INTO public.faqs (question, answer, display_order) VALUES
('How does WhatsApp ordering work?', 'Simply add items to your cart and click ''Order via WhatsApp''. You''ll be redirected to our WhatsApp Business where our team will guide you through payment options (bank transfer, card payment, or cash on delivery) and confirm your delivery details.', 1),
('What are your delivery options within Nigeria?', 'We deliver nationwide across Nigeria. Lagos and Abuja: 1-2 business days. Other major cities: 2-4 business days. Remote areas: 3-7 business days. Same-day delivery available in Lagos Island, Victoria Island, and Ikoyi for orders placed before 2 PM.', 2),
('Are your products authentic and high quality?', 'Absolutely! All our fashion and beauty products are 100% authentic and sourced directly from verified suppliers. We provide quality guarantees and detailed product descriptions with actual photos. Every item goes through quality control before shipping.', 3),
('What is your return and exchange policy?', 'We offer 7-day returns for unworn items with original tags. Size exchanges are free within Lagos and Abuja - we''ll pick up and deliver the new size. For other locations, customers cover return shipping. Contact us via WhatsApp to initiate returns or exchanges.', 4);