import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Eye, 
  Download,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { useAdminStore } from '@/lib/adminStore';
import AdminDataTable, { type TableColumn, type TableAction } from '@/components/admin/AdminDataTable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { mockOrders } from '@/lib/mockOrders';
import type { Order, OrderStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';

const AdminOrders: React.FC = () => {
  const { setCurrentView, updateOrderStatus } = useAdminStore();
  const { toast } = useToast();
  const { isMobile } = useResponsiveDesign();
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentView('orders');
  }, [setCurrentView]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'refunded':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'refunded':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const columns: TableColumn[] = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (value: string) => (
        <div className="font-mono text-sm">
          #{value.slice(-8).toUpperCase()}
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Customer',
      sortable: true,
      render: (address: Order['address']) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {address.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {address.email}
          </p>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (items: Order['items']) => (
        <div className="text-sm">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium">
          {formatCurrency(value)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status: OrderStatus) => (
        <Badge 
          className={`text-xs ${getStatusColor(status)}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value: string) => (
        <div className="text-xs text-muted-foreground">
          {formatDate(value)}
        </div>
      ),
    },
  ];

  const actions: TableAction[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (order: Order) => {
        toast({
          title: 'Order Details',
          description: `Viewing order #${order.id.slice(-8).toUpperCase()}`,
        });
        // TODO: Implement view order details
      },
    },
    {
      label: 'Mark as Processing',
      onClick: async (order: Order) => {
        if (order.status === 'pending') {
          try {
            await updateOrderStatus(order.id, 'processing');
            toast({
              title: 'Status Updated',
              description: `Order #${order.id.slice(-8).toUpperCase()} marked as processing`,
            });
            // Refresh the data
            setFilteredOrders(prev => 
              prev.map(o => o.id === order.id ? { ...o, status: 'processing' as OrderStatus } : o)
            );
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to update order status',
              variant: 'destructive',
            });
          }
        }
      },
    },
    {
      label: 'Mark as Shipped',
      onClick: async (order: Order) => {
        if (order.status === 'processing') {
          try {
            await updateOrderStatus(order.id, 'shipped');
            toast({
              title: 'Status Updated',
              description: `Order #${order.id.slice(-8).toUpperCase()} marked as shipped`,
            });
            // Refresh the data
            setFilteredOrders(prev => 
              prev.map(o => o.id === order.id ? { ...o, status: 'shipped' as OrderStatus } : o)
            );
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to update order status',
              variant: 'destructive',
            });
          }
        }
      },
    },
  ];

  const handleSearch = (query: string) => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const filtered = mockOrders.filter(order =>
        order.id.toLowerCase().includes(query.toLowerCase()) ||
        order.address.name.toLowerCase().includes(query.toLowerCase()) ||
        order.address.email.toLowerCase().includes(query.toLowerCase()) ||
        order.status.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOrders(filtered);
      setIsLoading(false);
    }, 300);
  };

  // Calculate stats
  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const processingOrders = mockOrders.filter(o => o.status === 'processing').length;
  const completedOrders = mockOrders.filter(o => o.status === 'delivered').length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-h2 font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
        
        <TooltipProvider>
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="tap-target-md">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter orders by status, date, or customer</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="tap-target-md">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export orders to CSV or PDF</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total Orders
              </p>
              <p className="text-xl font-bold lg:text-2xl">
                {totalOrders}
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Pending
              </p>
              <p className="text-xl font-bold lg:text-2xl text-warning">
                {pendingOrders}
              </p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Processing
              </p>
              <p className="text-xl font-bold lg:text-2xl text-info">
                {processingOrders}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-info" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Completed
              </p>
              <p className="text-xl font-bold lg:text-2xl text-success">
                {completedOrders}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <AdminDataTable
        title="Recent Orders"
        description="Track and manage customer orders and fulfillment"
        columns={columns}
        data={filteredOrders}
        actions={actions}
        searchPlaceholder="Search orders..."
        onSearch={handleSearch}
        isLoading={isLoading}
        emptyMessage="No orders found. Orders will appear here as customers make purchases."
        pagination={{
          page: 1,
          pageSize: 20,
          total: filteredOrders.length,
          onPageChange: (page) => {
            // TODO: Implement pagination
            console.log('Page changed to:', page);
          },
        }}
      />
    </div>
  );
};

export default AdminOrders;