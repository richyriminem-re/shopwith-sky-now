import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MultiTabSyncIndicator from '@/components/MultiTabSyncIndicator';

interface CartHeaderProps {
  title?: string;
  // Multi-tab sync props
  syncStatus?: "synced" | "syncing" | "conflict" | "offline";
  isLeader?: boolean;
  activeTabs?: number;
  conflictCount?: number;
  onForceSync?: () => void;
  onResolveConflicts?: () => void;
}

const CartHeader = ({ 
  title = "Shopping Cart",
  syncStatus,
  isLeader,
  activeTabs,
  conflictCount,
  onForceSync,
  onResolveConflicts
}: CartHeaderProps) => {
  const navigate = useNavigate();
  const { getItemCount } = useCartStore();
  const itemCount = getItemCount();

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-background/95 border-b border-border/50 px-4 py-4 mb-6 animate-fade-in shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <ShoppingBag size={24} className="text-primary drop-shadow-sm" />
              {itemCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 p-0 flex items-center justify-center text-xs font-bold animate-scale-in bg-primary text-primary-foreground shadow-md"
                >
                  {itemCount}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight truncate">
                {title}
              </h1>
              {itemCount > 0 ? (
                <p className="text-sm text-muted-foreground font-medium">
                  {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your cart is empty
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {syncStatus && (
            <MultiTabSyncIndicator
              syncStatus={syncStatus}
              isLeader={isLeader}
              activeTabs={activeTabs}
              conflictCount={conflictCount}
              onForceSync={onForceSync}
              onResolveConflicts={onResolveConflicts}
              className="hidden sm:flex"
            />
          )}
          
          {itemCount > 0 && (
            <Badge variant="outline" className="hidden lg:flex px-3 py-1 font-medium">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
};

export default CartHeader;