import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, CreditCard, Shield, Truck, Headphones, Zap } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const customerLinks = [{
    name: 'Contact Us',
    path: '/contact'
  }, {
    name: 'FAQ',
    path: '/faq'
  }, {
    name: 'Track Order',
    path: '/orders'
  }];
  
  const companyLinks = [{
    name: 'About Us',
    path: '/about'
  }, {
    name: 'Careers',
    path: '/careers'
  }, {
    name: 'Privacy Policy',
    path: '/privacy'
  }, {
    name: 'Terms of Service',
    path: '/terms'
  }, {
    name: 'Sustainability',
    path: '/sustainability'
  }];
  
  const categoryLinks = [{
    name: 'Bags & Shoes',
    path: '/product?primary=bags-shoes'
  }, {
    name: "Men's Fashion",
    path: '/product?primary=mens-fashion'
  }, {
    name: "Women's Fashion",
    path: '/product?primary=womens-fashion'
  }, {
    name: 'Beauty & Fragrance',
    path: '/product?primary=beauty-fragrance'
  }, {
    name: 'New Arrivals',
    path: '/product?sort=newest'
  }];

  return (
    <footer className="neu-surface dark:neu-surface border-t border-neu-border dark:border-neu-border mt-16 shadow-neu dark:shadow-neu-dark">
      {/* Trust Badges */}
      <div className="border-b border-neu-border">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-0">
              <div className="neu-surface p-2 sm:p-3 rounded-full flex-shrink-0">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-neu-primary text-sm sm:text-base">Free Shipping</h4>
                <p className="text-xs sm:text-sm text-neu-muted">On orders over ₦100K</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-0">
              <div className="neu-surface p-2 sm:p-3 rounded-full flex-shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-neu-primary text-sm sm:text-base">Secure Payment</h4>
                <p className="text-xs sm:text-sm text-neu-muted">100% protected</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-0">
              <div className="neu-surface p-2 sm:p-3 rounded-full flex-shrink-0">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-neu-primary text-sm sm:text-base">24/7 Support</h4>
                <p className="text-xs sm:text-sm text-neu-muted">We're here anytime you need us</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-0">
              <div className="neu-surface p-2 sm:p-3 rounded-full flex-shrink-0">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-neu-primary text-sm sm:text-base">Fast Delivery</h4>
                <p className="text-xs sm:text-sm text-neu-muted">Get your order quicker</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-neu-primary">Shop With Sky</h3>
            <p className="text-neu-muted text-sm sm:text-base leading-relaxed max-w-sm mx-auto sm:mx-0">
              Discover the latest trends and timeless pieces. Quality fashion that speaks to your unique style.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-neu-muted">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">+234 801 234 5678</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-neu-muted">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">help@shopwithsky.com</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-neu-muted">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-center sm:text-left">Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h4 className="font-semibold text-neu-primary text-base sm:text-lg">Customer Service</h4>
            <ul className="space-y-2">
              {customerLinks.map(link => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm sm:text-base text-neu-muted hover:text-primary transition-colors inline-block py-1 touch-manipulation"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
            <h4 className="font-semibold text-neu-primary text-base sm:text-lg">Shop</h4>
            <ul className="space-y-2">
              {categoryLinks.map(link => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm sm:text-base text-neu-muted hover:text-primary transition-colors inline-block py-1 touch-manipulation"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3 sm:space-y-4 text-center sm:text-left col-span-1 sm:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-neu-primary text-base sm:text-lg">Stay Updated</h4>
            <p className="text-sm sm:text-base text-neu-muted max-w-sm mx-auto sm:mx-0">
              Subscribe to get updates on new arrivals and exclusive offers.
            </p>
            
            <div className="space-y-3">
              <div className="flex flex-col xs:flex-row gap-2 max-w-sm mx-auto sm:mx-0">
                <Input 
                  id="newsletter-email" 
                  name="newsletter-email" 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 text-sm sm:text-base min-h-[44px]" 
                  aria-label="Newsletter email address" 
                />
                <Button 
                  size="sm" 
                  className="px-4 py-2 xs:py-0 w-full xs:w-auto min-h-[44px] touch-manipulation" 
                  aria-label="Subscribe to newsletter"
                >
                  <Mail className="w-4 h-4 mr-2 xs:mr-0" />
                  <span className="xs:hidden">Subscribe</span>
                </Button>
              </div>
              
              {/* Social Media */}
              <div className="flex justify-center sm:justify-start gap-3 pt-2">
                <a 
                  href="#" 
                  className="neu-surface p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-[#25D366]/10 focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center" 
                  aria-label="Follow us on WhatsApp"
                >
                  <i className="fa-brands fa-whatsapp text-base sm:text-lg text-[#25D366] hover:text-[#128C7E] transition-colors duration-300"></i>
                </a>
                <a 
                  href="#" 
                  className="neu-surface p-2 sm:p-3 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-[#E4405F]/10 focus:outline-none focus:ring-2 focus:ring-primary/20 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center" 
                  aria-label="Follow us on Instagram"
                >
                  <i className="fa-brands fa-instagram text-base sm:text-lg text-[#E4405F] hover:text-[#C13584] transition-colors duration-300"></i>
                </a>
                <a 
                  href="#" 
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

      {/* Bottom Bar */}
      <div className="border-t border-neu-border">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-neu-muted order-2 sm:order-1">
              © {currentYear} Shop With Sky. All rights reserved.
            </p>
            
            <div className="flex items-center gap-4 sm:gap-6 order-1 sm:order-2">
              <Link 
                to="/privacy" 
                className="text-xs sm:text-sm text-neu-muted hover:text-primary transition-colors touch-manipulation py-2"
              >
                Privacy
              </Link>
              <Link 
                to="/terms" 
                className="text-xs sm:text-sm text-neu-muted hover:text-primary transition-colors touch-manipulation py-2"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;