import { useEffect, useState, useMemo, useDeferredValue, Suspense } from 'react';
import { Package, Calendar, Truck, CheckCircle, Clock, XCircle, RotateCcw, Filter, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useOptimizedStore } from '@/hooks/useOptimizedStore';
import { useAccountPagePreloading } from '@/hooks/useDeepPagePreloading';
import { products } from '@/lib/products';
import { mockOrders } from '@/lib/mockOrders';
import OrdersSkeleton from '@/components/OrdersSkeleton';
import { LoadingErrorBoundary } from '@/components/LoadingErrorBoundary';
import type { CartItem, OrderStatus } from '@/types';

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
      return <CheckCircle size={20} className="text-green-500" />;
    case 'shipped':
      return <Truck size={20} className="text-blue-500" />;
    case 'processing':
      return <Clock size={20} className="text-orange-500" />;
    case 'pending':
      return <Clock size={20} className="text-yellow-500" />;
    case 'cancelled':
      return <XCircle size={20} className="text-red-500" />;
    case 'refunded':
      return <RotateCcw size={20} className="text-purple-500" />;
    default:
      return <Clock size={20} className="text-orange-500" />;
  }
};

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
      return 'Delivered';
    case 'shipped':
      return 'Shipped';
    case 'processing':
      return 'Processing';
    case 'pending':
      return 'Pending';
    case 'cancelled':
      return 'Cancelled';
    case 'refunded':
      return 'Refunded';
    default:
      return 'Processing';
  }
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
      return 'text-green-600';
    case 'shipped':
      return 'text-blue-600';
    case 'processing':
      return 'text-orange-600';
    case 'pending':
      return 'text-yellow-600';
    case 'cancelled':
      return 'text-red-600';
    case 'refunded':
      return 'text-purple-600';
    default:
      return 'text-orange-600';
  }
};

// Status timeline component
const StatusTimeline = ({ statusHistory }: { statusHistory: any[] }) => {
  const getTimelineIcon = (status: OrderStatus, isCompleted: boolean) => {
    const iconSize = 16;
    const className = isCompleted ? "text-green-500" : "text-neu-muted";
    
    switch (status) {
      case 'pending':
        return <Clock size={iconSize} className={className} />;
      case 'processing':
        return <Package size={iconSize} className={className} />;
      case 'shipped':
        return <Truck size={iconSize} className={className} />;
      case 'delivered':
        return <CheckCircle size={iconSize} className={className} />;
      case 'cancelled':
        return <XCircle size={iconSize} className="text-red-500" />;
      case 'refunded':
        return <RotateCcw size={iconSize} className="text-purple-500" />;
      default:
        return <Clock size={iconSize} className={className} />;
    }
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
        const isCompleted = statusHistory.some(h => h.status === status);
        const isCurrent = statusHistory[statusHistory.length - 1]?.status === status;
        
        return (
          <div key={status} className="flex items-center gap-1 flex-shrink-0">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
              ${isCompleted 
                ? 'bg-green-50 border-green-200' 
                : isCurrent 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-neu-muted/10 border-neu-border'
              }
            `}>
              {getTimelineIcon(status as OrderStatus, isCompleted)}
            </div>
            {index < 3 && (
              <div className={`
                w-4 h-0.5 transition-all
                ${isCompleted ? 'bg-green-300' : 'bg-neu-border'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Helper function to get product details for order items
const getOrderItemDetails = (item: CartItem) => {
  const product = products.find(p => p.id === item.productId);
  const variant = product?.variants.find(v => v.id === item.variantId);
  
  return {
    title: product?.title || 'Unknown Product',
    price: variant?.price || 0,
    qty: item.qty
  };
};

const OrdersContent = () => {
  const navigate = useNavigate();
  const { orderHistory, lastOrder } = useOptimizedStore(state => ({
    orderHistory: state.order.orderHistory,
    lastOrder: state.order.lastOrder
  }));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  
  // Deep page preloading for account-related routes
  useAccountPagePreloading();

  // Defer search query for non-blocking updates
  const deferredSearchQuery = useDeferredValue(searchQuery);
  
  // Memoize expensive operations
  const { allOrders, uniqueOrders, orders } = useMemo(() => {
    // Combine real orders with mock data for demo
    const allOrders = [...mockOrders, ...(lastOrder ? [lastOrder] : []), ...orderHistory];
    
    // Remove duplicates by ID
    const uniqueOrders = allOrders.filter((order, index, self) => 
      index === self.findIndex(o => o.id === order.id)
    );
    
    // Build curated list of exactly one order per required status
    const requiredStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

    // Pick the most recent order per status, in the required order
    const curatedOrders = requiredStatuses
      .map((status) => uniqueOrders.find((o) => o.status === status))
      .filter(Boolean) as typeof uniqueOrders;

    // Apply search and status filters against curated list only
    const filteredOrders = curatedOrders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
                           order.address.name.toLowerCase().includes(deferredSearchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    return {
      allOrders,
      uniqueOrders,
      orders: filteredOrders
    };
  }, [lastOrder, orderHistory, deferredSearchQuery, statusFilter]);
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (orders.length === 0) {
    return (
      <LoadingErrorBoundary>
        <div className="min-h-screen w-full pb-20 overflow-x-hidden">
      {/* Header with Back Button */}
      <header className="w-full px-3 sm:px-4 lg:px-6 mb-4 sm:mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="neu-surface p-4 sm:p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Package size={24} className="text-neu-primary flex-shrink-0" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-neu-primary">My Orders</h1>
                  <p className="text-sm text-neu-muted">Track your order history</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Empty State */}
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="neu-surface p-6 sm:p-8 text-center rounded-xl">
              <div className="w-16 h-16 neu-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-neu-muted" />
              </div>
              <h2 className="text-lg font-semibold text-neu-primary mb-2">
                No orders yet
              </h2>
              <p className="text-neu-muted mb-6 text-sm sm:text-base max-w-md mx-auto">
                When you place your first order, it will appear here
              </p>
              <Link to="/product" className="neu-button-primary inline-block min-h-[44px] px-6 py-3 text-sm sm:text-base">
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
        </div>
      </LoadingErrorBoundary>
    );
  }

  return (
    <LoadingErrorBoundary>
      <div className="min-h-screen w-full pb-20 overflow-x-hidden">
      {/* Header with Back Button */}
      <header className="w-full px-3 sm:px-4 lg:px-6 mb-4 sm:mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="neu-surface p-4 sm:p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Package size={24} className="text-neu-primary flex-shrink-0" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-neu-primary">My Orders</h1>
                  <p className="text-sm text-neu-muted">Track your order history</p>
                </div>
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neu-muted flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search your orders by ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="neu-surface w-full pl-10 pr-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-neu-primary/20 text-neu-primary placeholder-neu-muted text-sm sm:text-base min-h-[48px]"
                />
              </div>
              
              <div className="flex items-start gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Filter size={16} className="text-neu-muted flex-shrink-0 mt-2" />
                <div className="flex gap-2 min-w-max">
                  {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`
                        px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex-shrink-0 min-h-[40px] whitespace-nowrap
                        ${statusFilter === status 
                          ? 'neu-pressable text-neu-primary' 
                          : 'text-neu-muted hover:text-neu-primary'
                        }
                      `}
                    >
                      {status === 'all' ? 'All' : getStatusText(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-neu-muted mt-4 text-sm sm:text-base">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} in your history
            </p>
          </div>
        </div>
      </header>

      {/* Orders List */}
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {orders.map((order) => {
            return (
              <div key={order.id} className="neu-surface p-4 sm:p-6 rounded-xl overflow-hidden">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 mt-1 sm:mt-0">
                      {getStatusIcon(order.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-neu-primary text-sm sm:text-base truncate">
                        Order #{order.id}
                      </h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-neu-muted mt-1">
                        <Calendar size={12} className="flex-shrink-0" />
                        <span className="truncate">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className={`text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-neu-primary">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                </div>

                {/* Status Timeline */}
                {order.statusHistory && order.statusHistory.length > 1 && (
                  <div className="mb-4 overflow-x-auto">
                    <StatusTimeline statusHistory={order.statusHistory} />
                  </div>
                )}

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div className="mb-4 p-3 neu-elevation-1 rounded-lg overflow-hidden">
                    <div className="text-xs sm:text-sm text-neu-muted mb-1">Tracking Number</div>
                    <div className="font-mono text-neu-primary text-xs sm:text-sm break-all">{order.trackingNumber}</div>
                    {order.estimatedDelivery && order.status === 'shipped' && (
                      <div className="text-xs text-neu-muted mt-2">
                        Estimated delivery: {formatDate(order.estimatedDelivery)}
                      </div>
                    )}
                  </div>
                )}

                {/* Refund Info */}
                {order.refundInfo && (
                  <div className="mb-4 p-3 neu-elevation-1 rounded-lg border-l-4 border-purple-500 overflow-hidden">
                    <div className="text-xs sm:text-sm font-medium text-purple-600 mb-1">
                      Refund: {formatCurrency(order.refundInfo.amount)}
                    </div>
                    <div className="text-xs text-neu-muted break-words">
                      {order.refundInfo.reason} • {formatDate(order.refundInfo.processedAt)}
                    </div>
                    <div className="text-xs font-mono text-neu-muted mt-1 break-all">
                      ID: {order.refundInfo.refundId}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-2 mb-4 overflow-hidden">
                  {order.items.map((item, index) => {
                    const itemDetails = getOrderItemDetails(item);
                    
                    return (
                      <div key={index} className="flex justify-between items-start gap-2 text-xs sm:text-sm">
                        <span className="text-neu-primary min-w-0 flex-1 break-words">
                          {itemDetails.title} × {itemDetails.qty}
                        </span>
                        <span className="text-neu-muted flex-shrink-0">
                          {formatCurrency(itemDetails.price * itemDetails.qty)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Order Actions - Read Only */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-neu-accent">
                  {order.status === 'shipped' || order.status === 'delivered' ? (
                    <div className="neu-surface px-4 py-3 text-xs sm:text-sm font-medium text-neu-primary flex-1 min-h-[44px] rounded-lg flex items-center justify-center border border-neu-accent">
                      <Truck size={16} className="mr-2" />
                      Track Package
                    </div>
                  ) : null}
                  
                  <Link 
                    to={`/orders/${order.id}`}
                    className="neu-pressable px-4 py-3 text-xs sm:text-sm font-medium text-neu-primary flex-1 text-center min-h-[44px] rounded-lg flex items-center justify-center"
                  >
                    <Package size={16} className="mr-2" />
                    View Details
                  </Link>
                  
                  {order.status === 'delivered' && (
                    <div className="neu-surface px-4 py-3 text-xs sm:text-sm font-medium text-neu-primary flex-1 min-h-[44px] rounded-lg flex items-center justify-center border border-neu-accent">
                      <CheckCircle size={16} className="mr-2" />
                      Reorder
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </LoadingErrorBoundary>
  );
};

const Orders = () => {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersContent />
    </Suspense>
  );
};

export default Orders;