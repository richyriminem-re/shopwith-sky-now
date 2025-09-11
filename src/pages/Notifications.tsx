import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Package, ShoppingBag, Star, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotificationStore } from '@/lib/store';
import SEOHead from '@/components/SEOHead';
import { toast } from '@/hooks/use-toast';
import { formatDateTime } from '@/lib/utils';

const Notifications = () => {
  const navigate = useNavigate();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotificationStore();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'orders' | 'promotions'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'orders') return notification.type === 'order';
    if (filter === 'promotions') return notification.type === 'promotion';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="h-4 w-4" />;
      case 'promotion': return <Star className="h-4 w-4" />;
      case 'wishlist': return <ShoppingBag className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    toast({
      title: "Notification marked as read",
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "All notifications marked as read",
    });
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    toast({
      title: "Notification deleted",
    });
  };

  const handleClearAll = () => {
    clearAllNotifications();
    toast({
      title: "All notifications cleared",
    });
  };

  return (
    <>
      <SEOHead 
        title="Notifications | Your Account"
        description="Stay updated with your order status, promotions, and important alerts"
        keywords="notifications, alerts, orders, promotions"
      />
      
      <div className="min-h-screen pb-20">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-4xl">
          {/* Header */}
          <div className="neu-surface mt-4 p-4 sm:p-6 rounded-xl mb-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <h1 className="text-xl sm:text-2xl font-bold truncate">Notifications</h1>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs flex-shrink-0">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                    className="flex-1 sm:flex-none min-w-0"
                  >
                    <Check className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Mark all read</span>
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleClearAll}
                    className="flex-1 sm:flex-none min-w-0"
                  >
                    <Trash2 className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Clear all</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm px-2 py-2">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs sm:text-sm px-2 py-2">
                <span className="truncate">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-xs sm:text-sm px-2 py-2">
                Orders
              </TabsTrigger>
              <TabsTrigger value="promotions" className="text-xs sm:text-sm px-2 py-2">
                <span className="truncate">Promotions</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-4 sm:mt-6">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                    <Bell className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">No notifications</h3>
                    <p className="text-muted-foreground text-center text-sm sm:text-base max-w-md">
                      {filter === 'all' 
                        ? "You're all caught up! No notifications to show."
                        : `No ${filter} notifications to show.`
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`transition-all duration-200 ${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`p-2 rounded-full flex-shrink-0 ${
                            notification.type === 'order' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                            notification.type === 'promotion' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                            notification.type === 'wishlist' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {getIcon(notification.type)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                              <h3 className="font-semibold text-sm sm:text-base truncate pr-2">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs w-fit flex-shrink-0">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 break-words leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(notification.createdAt)}
                            </p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/30"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(notification.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                              title="Delete notification"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Notifications;