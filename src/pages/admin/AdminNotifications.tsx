import React from 'react';
import { Bell, AlertCircle, Info, CheckCircle, Send, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import SEOHead from '@/components/SEOHead';

const notifications = [
  {
    id: '1',
    type: 'alert',
    title: 'Low Stock Warning',
    message: 'Wireless Earbuds inventory is below 10 units',
    timestamp: '2 minutes ago',
    read: false
  },
  {
    id: '2',
    type: 'info',
    title: 'New Order Received',
    message: 'Order #12345 has been placed by Sarah Johnson',
    timestamp: '15 minutes ago',
    read: false
  },
  {
    id: '3',
    type: 'success',
    title: 'Payment Processed',
    message: 'Payment for order #12344 has been successfully processed',
    timestamp: '1 hour ago',
    read: true
  },
  {
    id: '4',
    type: 'alert',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will begin at 2:00 AM tomorrow',
    timestamp: '3 hours ago',
    read: true
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'alert':
      return <AlertCircle className="h-4 w-4 text-warning" />;
    case 'info':
      return <Info className="h-4 w-4 text-info" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-success" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const AdminNotifications: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Notifications | Sky Shop Admin"
        description="Manage system notifications, alerts, and communication settings in Sky Shop admin dashboard."
      />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">Manage system alerts and communication preferences</p>
          </div>
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            Send Announcement
          </Button>
        </div>

        {/* Notification Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 new today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Today</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">All notifications</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inbox" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inbox" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>System alerts and important updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-start gap-4 p-4 border rounded-lg ${
                        !notification.read ? 'bg-muted/30' : ''
                      }`}
                    >
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{notification.title}</h4>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Badge variant="destructive" className="h-2 w-2 p-0" />
                            )}
                            <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="compose" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Send Announcement</CardTitle>
                <CardDescription>Send notifications to customers or staff</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Notification title..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Write your message here..." 
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="priority" />
                  <Label htmlFor="priority">High Priority</Label>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Send to Customers</Button>
                  <Button variant="outline" className="flex-1">Send to Staff</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Browser Notifications</h4>
                      <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Low Stock Alerts</h4>
                      <p className="text-sm text-muted-foreground">Alert when inventory is low</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Order Notifications</h4>
                      <p className="text-sm text-muted-foreground">Notify about new orders</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Payment Alerts</h4>
                      <p className="text-sm text-muted-foreground">Alert on payment issues</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminNotifications;