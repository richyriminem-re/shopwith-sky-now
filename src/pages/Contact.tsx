import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWithNavigation from '@/components/PageWithNavigation';
import SEOHead from '@/components/SEOHead';
import ContactHero from '@/components/contact/ContactHero';
import ContactMethods from '@/components/contact/ContactMethods';
import ContactStoreInfo from '@/components/contact/ContactStoreInfo';
import { Button } from '@/components/ui/button';

const Contact = () => {
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageWithNavigation fallbackRoute="/">
      <SEOHead 
        title="Contact Us - Get Help & Support"
        description="Get in touch with our support team. Live chat, phone, email support available 24/7."
        keywords="contact support, customer service, live chat, phone support, help center"
      />
      
      <div className="pb-20">
        <ContactHero />
        <ContactMethods />
        
        {/* Newsletter/WhatsApp Section */}
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-md mx-auto">
            <div className="space-y-3 sm:space-y-4 text-center">
              <h4 className="font-semibold text-neu-primary text-base sm:text-lg">Stay Updated</h4>
              <p className="text-sm sm:text-base text-neu-muted">
                🎉 Be the first to know! Join our WhatsApp group for new arrivals, special discounts, and VIP offers.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => window.open('http://chat.whatsapp.com/FPRjd2q6mu9Kpjpx7rJc0Q', '_blank')}
                  className="w-full min-h-[44px] touch-manipulation bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                  aria-label="Join WhatsApp Group"
                >
                  Join WhatsApp Group
                </Button>
                
                {/* Social Media */}
                <div className="flex justify-center gap-3 pt-2">
                  <a 
                    href="http://wa.me/message/QYOISFIVI4JBB1" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neu-surface p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-[#25D366]/10 focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center" 
                    aria-label="Message us on WhatsApp"
                  >
                    <i className="fa-brands fa-whatsapp text-base sm:text-lg text-[#25D366] hover:text-[#128C7E] transition-colors duration-300"></i>
                  </a>
                  <a 
                    href="https://instagram.com/sho.pwithsky" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neu-surface p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-[#E4405F]/10 focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center" 
                    aria-label="Follow us on Instagram"
                  >
                    <i className="fa-brands fa-instagram text-base sm:text-lg text-[#E4405F] hover:text-[#C13584] transition-colors duration-300"></i>
                  </a>
                  <a 
                    href="https://tiktok.com/@shopwithsky3" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neu-surface p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center" 
                    aria-label="Follow us on TikTok"
                  >
                    <i className="fa-brands fa-tiktok text-base sm:text-lg text-foreground hover:text-foreground transition-colors duration-300"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ContactStoreInfo />
      </div>
    </PageWithNavigation>
  );
};

export default Contact;