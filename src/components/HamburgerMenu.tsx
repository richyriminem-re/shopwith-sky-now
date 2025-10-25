import { useState, useTransition, startTransition } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Package, Heart, HelpCircle, 
  ShoppingBag, Crown, Sparkles, Flower2, Droplets, Backpack, 
  Star, ChevronDown, ChevronRight, X, Tag,
  Bell, Phone, FileText, Truck, Info, LogOut, LogIn
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet";

interface MenuCategory {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: { label: string; href: string; }[];
}

const categories: MenuCategory[] = [
  {
    id: 'bags-shoes',
    title: 'Bags & Shoes',
    icon: ShoppingBag,
    items: [
      { label: "Men's Shoes", href: '/product?category=mens-shoes' },
      { label: "Women's Shoes", href: '/product?category=womens-shoes' },
      { label: 'Bags & Handbags', href: '/product?category=bags' },
      { label: 'Backpacks & Travel', href: '/product?category=travel-bags' },
    ]
  },
  {
    id: 'mens-fashion',
    title: "Men's Fashion",
    icon: Crown,
    items: [
      { label: 'Tops', href: '/product?category=mens-tops' },
      { label: 'Bottoms', href: '/product?category=mens-bottoms' },
      { label: 'Outerwear', href: '/product?category=mens-outerwear' },
      { label: 'Accessories', href: '/product?category=mens-accessories' },
    ]
  },
  {
    id: 'womens-fashion',
    title: "Women's Fashion",
    icon: Flower2,
    items: [
      { label: 'Tops & Blouses', href: '/product?category=womens-tops' },
      { label: 'Dresses & Gowns', href: '/product?category=womens-dresses' },
      { label: 'Bottoms', href: '/product?category=womens-bottoms' },
      { label: 'Outerwear', href: '/product?category=womens-outerwear' },
      { label: 'Accessories', href: '/product?category=womens-accessories' },
    ]
  },
  {
    id: 'beauty-fragrance',
    title: 'Beauty & Fragrance',
    icon: Droplets,
    items: [
      { label: 'Perfumes', href: '/product?category=perfumes' },
      { label: 'Body Sprays', href: '/product?category=body-sprays' },
      { label: 'Skincare', href: '/product?category=skincare' },
      { label: 'Makeup', href: '/product?category=makeup' },
    ]
  }
];

interface HamburgerMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const HamburgerMenu = ({ children, open, onOpenChange }: HamburgerMenuProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  
  // TODO: Replace with actual auth state
  const isSignedIn = false; // This should come from your auth context/store
  const user = null; // This should come from your auth context/store

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(prev => 
      prev === categoryId ? null : categoryId
    );
  };

  const handleOrdersNavigation = () => {
    // Close menu immediately for responsive feel
    onOpenChange?.(false);
    
    // Navigate using transition for non-blocking navigation
    startTransition(() => {
      navigate('/orders');
    });
  };

  const quickLinks = [
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
  ];

  const helpItems = [
    { icon: Phone, label: 'Contact Us', href: '/contact' },
    { icon: HelpCircle, label: 'FAQs', href: '/faq' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="left" className="w-[70vw] max-w-none p-0 neu-surface [&>button]:hidden">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-4 py-2 border-b border-border">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Explore categories, access account features, and navigate the store
            </SheetDescription>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SheetClose asChild>
                  <button className="neu-icon-button">
                    <X size={16} />
                  </button>
                </SheetClose>
                <img 
                  src={settings.site_logo_url || "/lovable-uploads/e056f700-4487-46d1-967e-39e0eb41e922.png"} 
                  alt="Shop with Sky" 
                  className="h-10 w-auto md:h-12"
                />
              </div>
              <ThemeToggle />
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">

            {/* OUR CATEGORIES Section */}
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-neu-muted uppercase tracking-wide mb-3">
                Our Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="neu-surface rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between p-3 text-neu-primary hover:bg-neu-surface/50 transition-all duration-200 hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-3">
                        <category.icon size={18} className="transition-transform duration-200" />
                        <span className="text-sm font-medium">{category.title}</span>
                      </div>
                      <div className={`transition-transform duration-300 ${expandedCategory === category.id ? 'rotate-180' : 'rotate-0'}`}>
                        <ChevronDown size={16} />
                      </div>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-out ${
                      expandedCategory === category.id 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-3 pb-3 animate-fade-in">
                        <div className="space-y-1">
                          {category.items.map((item, index) => (
                            <Link
                              key={item.label}
                              to={item.href}
                              className="block px-3 py-2 text-sm text-neu-muted hover:text-neu-primary hover:bg-neu-accent/50 rounded-md transition-all duration-200 hover:translate-x-1"
                              style={{ animationDelay: `${index * 50}ms` }}
                              onClick={() => onOpenChange?.(false)}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Sections */}
            <div className="px-6 py-4 border-b border-border">
              <div className="space-y-2">
                <Link
                  to="/product?deals=true"
                  className="neu-pressable flex items-center gap-3 p-3 text-neu-primary hover:text-primary transition-colors"
                  onClick={() => onOpenChange?.(false)}
                >
                  <Tag size={18} />
                  <span className="text-sm font-medium">Deals & Discounts</span>
                </Link>
                <Link
                  to="/product?sort=newest"
                  className="neu-pressable flex items-center gap-3 p-3 text-neu-primary hover:text-primary transition-colors"
                  onClick={() => onOpenChange?.(false)}
                >
                  <Sparkles size={18} />
                  <span className="text-sm font-medium">New Arrivals</span>
                </Link>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-neu-muted uppercase tracking-wide mb-3">
                Quick Links
              </h3>
              <div className="space-y-2">
                {quickLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="neu-pressable flex items-center gap-3 p-3 text-neu-primary hover:text-primary transition-colors"
                    onClick={() => onOpenChange?.(false)}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Help & Info Section */}
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-neu-muted uppercase tracking-wide mb-3">
                Help & Info
              </h3>
              <div className="space-y-2">
                {helpItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="neu-pressable flex items-center gap-3 p-3 text-neu-primary hover:text-primary transition-colors"
                    onClick={() => onOpenChange?.(false)}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>


            {/* Account Controls - At the bottom */}
            {isSignedIn && (
              <div className="px-6 py-4">
                <button
                  onClick={() => {
                    // TODO: Implement logout functionality
                    onOpenChange?.(false);
                  }}
                  className="neu-pressable w-full flex items-center gap-3 p-3 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HamburgerMenu;