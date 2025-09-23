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
    const cartItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      const variant = product?.variants.find(v => v.id === item.variantId);
      
      return {
        ...item,
        product,
        variant
      };
    }).filter(item => item.product && item.variant);

    let message = "🛍️ *New Order from Shop With Sky*\n\n";
    
    // Order Reference
    if (orderReference) {
      message += `📋 *Order Reference:* ${orderReference}\n\n`;
    }
    
    // Customer Info
    if (customerInfo?.name) {
      message += `👤 *Customer:* ${customerInfo.name}\n`;
    }
    if (customerInfo?.phone) {
      message += `📱 *Phone:* ${customerInfo.phone}\n`;
    }
    if (customerInfo?.address) {
      message += `📍 *Address:* ${customerInfo.address}\n`;
    }
    message += "\n";
    
    // Order Items
    message += "📦 *Order Details:*\n";
    cartItems.forEach((item, index) => {
      message += `${index + 1}. *${item.product?.title}*\n`;
      if (item.variant?.color) message += `   Color: ${item.variant.color}\n`;
      if (item.variant?.size) message += `   Size: ${item.variant.size}\n`;
      message += `   Qty: ${item.qty} × ${formatCurrency(item.variant?.price || 0)}\n`;
      message += `   Subtotal: ${formatCurrency((item.variant?.price || 0) * item.qty)}\n\n`;
    });
    
    // Order Summary
    message += "💰 *Order Summary:*\n";
    message += `Subtotal: ${formatCurrency(subtotal)}\n`;
    message += `Shipping (${shippingOption}): ${formatCurrency(shipping)}\n`;
    if (discount > 0) {
      message += `Discount: -${formatCurrency(discount)}\n`;
      if (appliedPromoCodes.length > 0) {
        message += `Applied Codes: ${appliedPromoCodes.join(', ')}\n`;
      }
    }
    message += `*Total: ${formatCurrency(total)}*\n\n`;
    
    // Payment Options
    message += "💳 *Payment Options:*\n";
    message += "• Bank Transfer\n";
    message += "• Pay on Delivery\n";
    message += "• Mobile Money\n\n";
    
    message += "✅ Please confirm this order and let me know your preferred payment method.";
    
    return encodeURIComponent(message);
  }, [items, subtotal, shipping, discount, total, shippingOption, appliedPromoCodes, customerInfo]);

  const whatsappNumber = "2348112698594"; // Your WhatsApp Business number

  const handleWhatsAppOrder = () => {
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return {
    generateMessage: () => whatsappMessage,
    sendToWhatsApp: handleWhatsAppOrder,
    whatsappUrl: `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
  };
};