import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Bell,
  Plus
} from 'lucide-react';
import { useAdminStore } from '@/lib/adminStore';
import { cn, formatCurrency } from '@/lib/utils';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { mockOrders } from '@/lib/mockOrders';
import { products } from '@/lib/products';

const AdminDashboard: React.FC = () => {
  const { 
    metrics, 
    isLoadingMetrics, 
    loadMetrics,
    setCurrentView 
  } = useAdminStore();
  
  const { getGridColumns, isMobile } = useResponsiveDesign();

  useEffect(() => {
    setCurrentView('dashboard');
    if (!metrics && !isLoadingMetrics) {
      loadMetrics();
    }
  }, [metrics, isLoadingMetrics, loadMetrics, setCurrentView]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getPercentageChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  // Helper function to get low stock products
  const getLowStockProducts = () => {
    const lowStockItems: Array<{ product: typeof products[0]; variant: typeof products[0]['variants'][0] }> = [];
    
    products.forEach(product => {
      product.variants.forEach(variant => {
        if (variant.stock <= 10) { // Consider low stock as 10 or fewer items
          lowStockItems.push({ product, variant });
        }
      });
    });
    
    // Sort by stock level (lowest first) then by product title
    return lowStockItems.sort((a, b) => {
      if (a.variant.stock === b.variant.stock) {
        return a.product.title.localeCompare(b.product.title);
      }
      return a.variant.stock - b.variant.stock;
    });
  };

  // Mock previous period data for percentage calculations
  const previousMetrics = {
    revenue: 118000,
    orders: 2650,
    products: 150,
    customers: 1820,
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: metrics ? formatCurrency(metrics.totalRevenue) : '₦0',
      change: metrics ? getPercentageChange(metrics.totalRevenue, previousMetrics.revenue) : 0,
      icon: () => <span className="text-2xl font-bold text-success">₦</span>,
      color: 'text-success',
      bgColor: 'bg-gradient-to-br from-success/20 via-success/10 to-success/5',
      shadowColor: 'shadow-success/20',
      gradient: 'from-success/20 to-success/5',
    },
    {
      title: 'Total Orders',
      value: metrics ? formatNumber(metrics.totalOrders) : '0',
      change: metrics ? getPercentageChange(metrics.totalOrders, previousMetrics.orders) : 0,
      icon: ShoppingCart,
      color: 'text-info',
      bgColor: 'bg-gradient-to-br from-info/20 via-info/10 to-info/5',
      shadowColor: 'shadow-info/20',
      gradient: 'from-info/20 to-info/5',
    },
    {
      title: 'Products',
      value: metrics ? formatNumber(metrics.totalProducts) : '0',
      change: metrics ? getPercentageChange(metrics.totalProducts, previousMetrics.products) : 0,
      icon: Package,
      color: 'text-warning',
      bgColor: 'bg-gradient-to-br from-warning/20 via-warning/10 to-warning/5',
      shadowColor: 'shadow-warning/20',
      gradient: 'from-warning/20 to-warning/5',
    },
    {
      title: 'Customers',
      value: metrics ? formatNumber(metrics.totalCustomers) : '0',
      change: metrics ? getPercentageChange(metrics.totalCustomers, previousMetrics.customers) : 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5',
      shadowColor: 'shadow-primary/20',
      gradient: 'from-primary/20 to-primary/5',
    },
  ];

  const quickActions = [
    { label: 'View Products', href: '/admin/products', icon: Package },
    { label: 'Recent Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { label: 'Customers', href: '/admin/customers', icon: Users },
  ];

  if (isLoadingMetrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening in your shop.</p>
          </div>
        </div>
        
        {/* Loading State */}
        <div className={cn(
          'grid gap-4',
          `grid-cols-${getGridColumns(1, 2, 4)}`
        )}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-8 bg-muted rounded w-20" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg font-medium">
            Welcome back! Here's what's happening in your shop.
          </p>
        </div>
        
        {!isMobile && (
          <TooltipProvider>
            <div className="flex items-center gap-2 md:gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a 
                    href="/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="neu-pressable h-10 px-3 flex items-center gap-2 text-neu-primary hover:text-primary transition-colors focus-visible:ring-2 ring-sidebar-ring focus-visible:outline-none"
                  >
                    <Eye className="h-4 w-4" />
                    View Store
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open storefront in new tab</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="neu-icon-button h-10 w-10 relative text-neu-primary hover:text-primary transition-colors focus-visible:ring-2 ring-sidebar-ring focus-visible:outline-none"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 text-[10px] flex items-center justify-center p-0"
                    >
                      3
                    </Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View notifications</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="tap-target-md" asChild>
                    <Link to="/admin/products">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new product listing</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>

      {/* Stats Grid */}
      <div className={cn(
        'grid gap-4',
        `grid-cols-${getGridColumns(1, 2, 4)}`
      )}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          
          return (
            <Card 
              key={index} 
              className={cn(
                'relative overflow-hidden border-0 transition-all duration-300 hover:scale-[1.02]',
                'bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm',
                'shadow-[var(--shadow-elevation-2)] hover:shadow-[var(--shadow-elevation-3)]',
                stat.shadowColor
              )}
            >
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-50',
                stat.gradient
              )} />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'flex items-center text-sm font-semibold px-2 py-1 rounded-full',
                        isPositive 
                          ? 'text-success bg-success/10 border border-success/20' 
                          : 'text-destructive bg-destructive/10 border border-destructive/20'
                      )}>
                        {isPositive ? (
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(stat.change).toFixed(1)}%
                      </div>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div className={cn(
                    'h-16 w-16 rounded-2xl flex items-center justify-center relative',
                    'bg-gradient-to-br shadow-lg backdrop-blur-sm border border-white/20',
                    stat.bgColor
                  )}>
                    <Icon className={cn('h-8 w-8', stat.color)} />
                    <div className={cn(
                      'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20',
                      stat.gradient
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions - Mobile Optimized */}
      {isMobile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-16 flex flex-col space-y-2 tap-target-lg"
                    asChild
                  >
                    <a href={action.href}>
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{action.label}</span>
                    </a>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders & Inventory Alerts */}
      <div className={cn(
        'grid gap-6',
        isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
      )}>
        {/* Recent Orders */}
        <Card className="border-0 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm shadow-[var(--shadow-elevation-2)]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-xl">
              Recent Orders
              <Badge 
                variant="secondary" 
                className="bg-primary/10 text-primary border-primary/20 font-medium"
              >
                Latest
              </Badge>
            </CardTitle>
            <CardDescription className="text-base">
              Monitor and manage your most recent customer orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOrders.slice(0, 5).map((order) => (
                <div key={order.id} className={cn(
                  "p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50",
                  isMobile ? "space-y-3" : "flex items-center justify-between"
                )}>
                  {isMobile ? (
                    // Mobile Layout - Stack vertically
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold text-xs">
                            {order.address.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">#{order.id}</p>
                            <p className="text-xs text-muted-foreground">{order.address.name}</p>
                          </div>
                        </div>
                        <Badge 
                          className={cn(
                            'text-xs font-medium shrink-0',
                            order.status === 'delivered' && 'bg-success/20 text-success border-success/30',
                            order.status === 'shipped' && 'bg-info/20 text-info border-info/30',
                            order.status === 'processing' && 'bg-warning/20 text-warning border-warning/30',
                            order.status === 'pending' && 'bg-muted/50 text-muted-foreground border-muted',
                            order.status === 'cancelled' && 'bg-destructive/20 text-destructive border-destructive/30',
                            order.status === 'refunded' && 'bg-secondary/50 text-secondary-foreground border-secondary'
                          )}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-success">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Desktop Layout - Horizontal
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold text-sm">
                        {order.address.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">#{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">{order.address.name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-success">
                            {formatCurrency(order.total)}
                          </p>
                          <Badge 
                            className={cn(
                              'text-xs font-medium',
                              order.status === 'delivered' && 'bg-success/20 text-success border-success/30',
                              order.status === 'shipped' && 'bg-info/20 text-info border-info/30',
                              order.status === 'processing' && 'bg-warning/20 text-warning border-warning/30',
                              order.status === 'pending' && 'bg-muted/50 text-muted-foreground border-muted',
                              order.status === 'cancelled' && 'bg-destructive/20 text-destructive border-destructive/30',
                              order.status === 'refunded' && 'bg-secondary/50 text-secondary-foreground border-secondary'
                            )}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => setCurrentView('orders')}>
                  View All Orders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card className="border-0 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm shadow-[var(--shadow-elevation-2)]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-xl">
              Inventory Alerts
              <Badge 
                variant="secondary" 
                className="bg-warning/10 text-warning border-warning/20 font-medium"
              >
                {getLowStockProducts().length} alerts
              </Badge>
            </CardTitle>
            <CardDescription className="text-base">
              Products requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getLowStockProducts().slice(0, 5).map((item) => (
                <div key={`${item.product.id}-${item.variant.id}`} className={cn(
                  "p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50",
                  isMobile ? "space-y-3" : "flex items-center space-x-4"
                )}>
                  {isMobile ? (
                    // Mobile Layout - Stack vertically for better readability
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.product.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.variant.size} • {item.variant.color}
                          </p>
                        </div>
                        <Badge 
                          className={cn(
                            'text-xs font-medium shrink-0',
                            item.variant.stock === 0 && 'bg-destructive/20 text-destructive border-destructive/30',
                            item.variant.stock <= 5 && item.variant.stock > 0 && 'bg-warning/20 text-warning border-warning/30',
                            item.variant.stock <= 10 && item.variant.stock > 5 && 'bg-info/20 text-info border-info/30'
                          )}
                        >
                          {item.variant.stock === 0 ? 'Out of Stock' : `${item.variant.stock} left`}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between space-x-3">
                        <div className="flex-1">
                          <Progress 
                            value={(item.variant.stock / 25) * 100}
                            className={cn(
                              'h-2',
                              item.variant.stock === 0 && '[&>[data-state=complete]]:bg-destructive',
                              item.variant.stock <= 5 && item.variant.stock > 0 && '[&>[data-state=complete]]:bg-warning',
                              item.variant.stock <= 10 && item.variant.stock > 5 && '[&>[data-state=complete]]:bg-info'
                            )}
                          />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground shrink-0">
                          {formatCurrency(item.variant.price)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Desktop Layout - Horizontal
                    <>
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold truncate">{item.product.title}</p>
                          <Badge 
                            className={cn(
                              'text-xs font-medium',
                              item.variant.stock === 0 && 'bg-destructive/20 text-destructive border-destructive/30',
                              item.variant.stock <= 5 && item.variant.stock > 0 && 'bg-warning/20 text-warning border-warning/30',
                              item.variant.stock <= 10 && item.variant.stock > 5 && 'bg-info/20 text-info border-info/30'
                            )}
                          >
                            {item.variant.stock === 0 ? 'Out of Stock' : `${item.variant.stock} left`}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.variant.size} • {item.variant.color}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-2">
                            <Progress 
                              value={(item.variant.stock / 25) * 100}
                              className={cn(
                                'h-2',
                                item.variant.stock === 0 && '[&>[data-state=complete]]:bg-destructive',
                                item.variant.stock <= 5 && item.variant.stock > 0 && '[&>[data-state=complete]]:bg-warning',
                                item.variant.stock <= 10 && item.variant.stock > 5 && '[&>[data-state=complete]]:bg-info'
                              )}
                            />
                          </div>
                          <p className="text-xs font-medium text-muted-foreground">
                            {formatCurrency(item.variant.price)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => setCurrentView('products')}>
                  Manage Inventory
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;