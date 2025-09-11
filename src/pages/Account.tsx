import { useEffect } from 'react';
import { User, Package, Heart, MapPin, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingErrorBoundary } from '@/components/LoadingErrorBoundary';
import SEOHead from '@/components/SEOHead';
import BackButton from '@/components/ui/BackButton';
import PageWithNavigation from '@/components/PageWithNavigation';

const Account = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const menuItems = [
    { icon: Package, label: 'Orders', description: 'Track your purchases' },
    { icon: Heart, label: 'Wishlist', description: 'Save items you love—tap the heart.' },
    { icon: MapPin, label: 'Addresses', description: 'Manage shipping addresses' },
    { icon: Settings, label: 'Settings', description: 'Account preferences' },
  ];

  return (
    <PageWithNavigation fallbackRoute="/">
      <SEOHead 
        title="My Account - Shop With Sky"
        description="Manage your Shop With Sky account, view orders, update preferences, and track your shopping history."
        keywords="account, profile, orders, wishlist, settings, shop with sky"
        type="website"
      />
      
      <LoadingErrorBoundary>
        <div className="pb-20">
      {/* Header */}
      <header className="neu-surface mx-4 mt-4 p-6 mb-6">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton 
            fallback="/" 
            breadcrumbHints={['Account']}
          />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 neu-surface rounded-full flex items-center justify-center">
            <User size={24} className="text-neu-muted" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neu-primary">Welcome back</h1>
            <p className="text-neu-muted">guest@example.com</p>
          </div>
        </div>
        
        <button 
          className="neu-button-primary w-full"
          onClick={() => navigate('/login')}
        >
          Sign In / Create Account
        </button>
      </header>

      {/* Quick Stats */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="neu-surface p-4 text-center rounded-xl">
            <div className="text-2xl font-bold text-neu-primary">0</div>
            <div className="text-sm text-neu-muted">Orders</div>
          </div>
          <div className="neu-surface p-4 text-center rounded-xl">
            <div className="text-2xl font-bold text-neu-primary">0</div>
            <div className="text-sm text-neu-muted">Wishlist</div>
          </div>
          <div className="neu-surface p-4 text-center rounded-xl">
            <div className="text-2xl font-bold text-neu-primary">₦0</div>
            <div className="text-sm text-neu-muted">Saved</div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="neu-pressable w-full p-4 flex items-center gap-4 text-left"
          >
            <div className="neu-surface p-3 rounded-lg">
              <item.icon size={20} className="text-neu-muted" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neu-primary">{item.label}</h3>
              <p className="text-sm text-neu-muted">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <div className="px-4 mt-8">
        <button className="neu-pressable w-full p-4 flex items-center justify-center gap-3 text-red-500">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* App Info */}
      <div className="px-4 mt-8 text-center">
        <p className="text-xs text-neu-muted mb-2">Shop with Sky v1.0.0</p>
        <div className="flex justify-center gap-4 text-xs text-neu-muted">
          <button>Privacy Policy</button>
          <button>Terms of Service</button>
          <button>Help & Support</button>
        </div>
      </div>
      </div>
      </LoadingErrorBoundary>
    </PageWithNavigation>
  );
};

export default Account;