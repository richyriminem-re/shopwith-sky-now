import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppContactProps {
  productName?: string;
  productId?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const WhatsAppContact = ({
  productName,
  productId,
  className = '',
  variant = 'default',
  size = 'default'
}: WhatsAppContactProps) => {
  const whatsappNumber = "2348112698594";
  
  const generateInquiryMessage = () => {
    let message = "Hello! I'm interested in ";
    
    if (productName) {
      message += `*${productName}*`;
      if (productId) {
        message += ` (Product ID: ${productId})`;
      }
    } else {
      message += "your products";
    }
    
    message += ".\n\nCould you please provide more information?";
    
    return encodeURIComponent(message);
  };

  const handleWhatsAppInquiry = () => {
    const message = generateInquiryMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:+${whatsappNumber}`, '_self');
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={handleWhatsAppInquiry}
        variant={variant}
        size={size}
        className="flex-1 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>
      
      <Button
        onClick={handleCall}
        variant="outline"
        size={size}
        className="px-3"
      >
        <Phone className="h-4 w-4" />
      </Button>
    </div>
  );
};