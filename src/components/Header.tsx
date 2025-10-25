import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import HamburgerMenu from './HamburgerMenu';
import SearchInput from './SearchInput';
import ThemeToggle from './ThemeToggle';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.items);
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const { settings } = useSiteSettings();

  return (
    <header className="neu-floating sticky top-0 z-50 w-full px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center justify-between w-full mb-2">
        {/* Hamburger Menu and Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <HamburgerMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <button 
              className="neu-icon-button relative min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
            >
              <div className={`transition-all duration-300 ease-in-out ${isMenuOpen ? 'rotate-90 scale-110' : 'rotate-0 scale-100'}`}>
                {isMenuOpen ? (
                  <X size={16} className="animate-in fade-in-0 duration-200" />
                ) : (
                  <Menu size={16} className="animate-in fade-in-0 duration-200" />
                )}
              </div>
            </button>
          </HamburgerMenu>
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src={settings.site_logo_url || "/lovable-uploads/e056f700-4487-46d1-967e-39e0eb41e922.png"} 
              alt="Shop with Sky" 
              className="h-10 w-auto md:h-12 cursor-pointer"
            />
          </Link>
        </div>

        {/* Essential Icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="md:hidden">
            <ThemeToggle />
          </span>
          
          <span className="hidden md:inline-flex">
            <ThemeToggle />
          </span>
          
          
          <Link 
            to="/cart" 
            className="neu-icon-button relative min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Shopping cart${cartItemsCount > 0 ? ` (${cartItemsCount} items)` : ''}`}
          >
            <ShoppingCart size={16} />
            {cartItemsCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium text-[10px]"
                aria-hidden="true"
              >
                {cartItemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      
      {/* Enhanced Search Bar */}
      <div className="w-full">
        <SearchInput
          placeholder="Search products..."
          className="w-full"
          showSuggestions={true}
          debounceMs={300}
          onSearch={(query) => {
            // Navigate to products page when searching from header
            if (query.trim()) {
              navigate(`/product?search=${encodeURIComponent(query.trim())}`);
            }
          }}
        />
      </div>
    </header>
  );
};

export default Header;