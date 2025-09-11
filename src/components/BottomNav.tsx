import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCartStore } from '@/lib/store';

const BottomNav = () => {
  const itemCount = useCartStore((state) => state.getItemCount());

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Products', path: '/product' },
    { icon: ShoppingBag, label: 'Cart', path: '/cart', badge: itemCount },
    { icon: User, label: 'Account', path: '/account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 neu-floating rounded-t-2xl px-2 py-2 mx-2 mb-2">
      <div className="flex items-center justify-around">
        {navItems.map(({ icon: Icon, label, path, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => 
              `relative flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'neu-pressable active text-neu-primary' 
                  : 'text-neu-muted hover:text-neu-primary'
              }`
            }
          >
            <div className="relative">
              <Icon size={20} />
              {badge && badge > 0 && (
                <span className="absolute -top-2 -right-2 neu-chip text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;