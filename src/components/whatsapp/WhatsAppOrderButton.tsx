import { useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppOrderGenerator } from './WhatsAppOrderGenerator';
import type { CartItem } from '@/types';

interface WhatsAppOrderButtonProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingOption: string;
  disabled?: boolean;
}

export const WhatsAppOrderButton = ({
  items,
  subtotal,
  shipping,
  discount,
  total,
  shippingOption,
  disabled
}: WhatsAppOrderButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const { sendToWhatsApp } = WhatsAppOrderGenerator({
    items,
    subtotal,
    shipping,
    discount,
    total,
    shippingOption,
    customerInfo
  });

  const handleQuickOrder = () => {
    sendToWhatsApp();
  };

  const handleDetailedOrder = () => {
    if (!customerInfo.name.trim()) {
      return;
    }
    sendToWhatsApp();
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Quick WhatsApp Order */}
      <Button
        onClick={handleQuickOrder}
        disabled={disabled}
        className="w-full min-h-[48px] sm:min-h-[52px] text-sm sm:text-base font-semibold bg-[#25D366] hover:bg-[#25D366]/90 text-white"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Order via WhatsApp
      </Button>

      {/* Detailed Order with Customer Info */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full min-h-[44px] text-sm font-medium"
          >
            <Phone className="mr-2 h-4 w-4" />
            Order with Details
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              Complete Your WhatsApp Order
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea
                id="address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your complete delivery address"
                className="mt-1"
                rows={3}
              />
            </div>
            
            <Button
              onClick={handleDetailedOrder}
              disabled={!customerInfo.name.trim()}
              className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Send Order to WhatsApp
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Your order details will be sent to our WhatsApp for confirmation
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};