import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { products } from '@/lib/products';
import type { CartItem } from '@/types';

interface WhatsAppOrderGeneratorProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingOption: string;
  appliedPromoCodes?: string[];
  orderReference?: string;
  customerInfo?: {
    name?: string;
    phone?: string;
    address?: string;
  };
}

export const WhatsAppOrderGenerator = ({
  items,
  subtotal,
  shipping,
  discount,
  total,
  shippingOption,
  appliedPromoCodes = [],
  orderReference,
  customerInfo
}: WhatsAppOrderGeneratorProps) => {
  
  const whatsappMessage = useMemo(() => {
    const message = "Hi Shop With Sky 👋 I've placed an order. Please see my receipt and guide me on the payment process.";
    return encodeURIComponent(message);
  }, []);

  const whatsappNumber = "2348112698594"; // Your WhatsApp Business number

  const handleWhatsAppOrder = () => {
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${whatsappMessage}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
  };

  return {
    generateMessage: () => whatsappMessage,
    sendToWhatsApp: handleWhatsAppOrder,
    whatsappUrl: `https://api.whatsapp.com/send/?phone=${whatsappNumber}&text=${whatsappMessage}&type=phone_number&app_absent=0`
  };
};