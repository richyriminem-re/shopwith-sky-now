import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Instagram, Music } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const ContactUpdates = () => {
  const { settings } = useSiteSettings();
  return (
    <section className="px-4 mb-8">
      <Card className="neu-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-foreground text-lg sm:text-xl">
            <MessageCircle size={20} className="text-primary" />
            Stay Updated
          </CardTitle>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            🎉 Be the first to know! Join our WhatsApp group for new arrivals, special discounts, and VIP offers.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* WhatsApp Group Button */}
          <Button 
            onClick={() => window.open(settings.footer_whatsapp_group || 'https://chat.whatsapp.com/your-group-link', '_blank')}
            className="w-full min-h-[48px] sm:min-h-[52px] touch-manipulation bg-[#25D366] hover:bg-[#25D366]/90 text-white text-base font-medium"
            aria-label="Join WhatsApp Group"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Join WhatsApp Group
          </Button>
          
          {/* Social Media Links */}
          <div className="pt-2">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Follow us on social media
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href={settings.footer_whatsapp_contact || 'https://wa.me/2349057775190'} 
                target="_blank"
                rel="noopener noreferrer"
                className="neu-surface p-3 sm:p-4 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-[#25D366]/10 focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation min-h-[48px] min-w-[48px] flex items-center justify-center group" 
                aria-label="Message us on WhatsApp"
              >
                <i className="fa-brands fa-whatsapp text-lg sm:text-xl text-[#25D366] group-hover:text-[#128C7E] transition-colors duration-300"></i>
              </a>
              
              <a 
                href={settings.footer_instagram || 'https://instagram.com/shopwithsky'} 
                target="_blank"
                rel="noopener noreferrer"
                className="neu-surface p-3 sm:p-4 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-[#E4405F]/10 focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation min-h-[48px] min-w-[48px] flex items-center justify-center group" 
                aria-label="Follow us on Instagram"
              >
                <i className="fa-brands fa-instagram text-lg sm:text-xl text-[#E4405F] group-hover:text-[#C13584] transition-colors duration-300"></i>
              </a>
              
              <a 
                href={settings.footer_tiktok || 'https://tiktok.com/@shopwithsky'} 
                target="_blank"
                rel="noopener noreferrer"
                className="neu-surface p-3 sm:p-4 rounded-xl transition-all duration-300 hover:scale-110 hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation min-h-[48px] min-w-[48px] flex items-center justify-center group" 
                aria-label="Follow us on TikTok"
              >
                <i className="fa-brands fa-tiktok text-lg sm:text-xl text-foreground group-hover:text-foreground transition-colors duration-300"></i>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ContactUpdates;