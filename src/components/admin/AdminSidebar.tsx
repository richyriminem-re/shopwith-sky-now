import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Home,
  TrendingUp,
  Bell,
  Sparkles,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/lib/adminStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';

interface AdminSidebarProps {
  className?: string;
}

interface AdminNavGroup {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    href: string;
    badge?: string;
    description: string;
  }[];
}

const navGroups: AdminNavGroup[] = [
  {
    id: 'main',
    title: 'Main',
    icon: BarChart3,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: BarChart3,
        href: '/admin',
        description: 'Main Overview',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: TrendingUp,
        href: '/admin/analytics',
        description: 'Performance Data',
      },
    ]
  },
  {
    id: 'management',
    title: 'Management',
    icon: Package,
    items: [
      {
        id: 'products',
        label: 'Products',
        icon: Package,
        href: '/admin/products',
        description: 'Manage Inventory',
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: ShoppingCart,
        href: '/admin/orders',
        badge: '12',
        description: 'Process Orders',
      },
      {
        id: 'customers',
        label: 'Customers',
        icon: Users,
        href: '/admin/customers',
        description: 'Customer Management',
      },
    ]
  },
  {
    id: 'system',
    title: 'System',
    icon: Settings,
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        href: '/admin/notifications',
        badge: '3',
        description: 'System Alerts',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: '/admin/settings',
        description: 'Admin Settings',
      },
    ]
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className }) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    currentUser, 
    logout 
  } = useAdminStore();

  // Optimized active state detection with memoization
  const isActive = useCallback((href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(href) && location.pathname !== '/admin';
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    logout();
  }, []); // Removed logout from deps to prevent infinite loops

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  return (
    <aside 
      ref={sidebarRef}
      className={cn(
        'flex flex-col h-screen bg-background border-r border-border transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
        {/* Header Section */}
        <div className={cn("py-4 border-b border-border", sidebarCollapsed ? "px-2" : "px-6")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="neu-icon-button"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronLeft size={16} />
                )}
              </Button>
              {!sidebarCollapsed && (
                <img 
                  src="/lovable-uploads/e056f700-4487-46d1-967e-39e0eb41e922.png" 
                  alt="Sky Shop Admin" 
                  className="h-10 w-auto"
                />
              )}
            </div>
            {!sidebarCollapsed && <ThemeToggle />}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto">
          {sidebarCollapsed ? (
            // Collapsed view - Icon-only navigation
            <nav className="px-2 py-4 space-y-2">
              {navGroups.flatMap(group => group.items).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Tooltip key={item.id} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        className={cn(
                          'neu-pressable flex items-center justify-center w-full min-h-[44px] min-w-[44px] p-3 text-neu-primary hover:text-primary transition-colors',
                          active && 'bg-primary/10 text-primary border border-primary/20'
                        )}
                      >
                        <Icon size={18} />
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      <div className="space-y-1">
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-xs text-neu-muted">{item.description}</p>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge} new
                          </Badge>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          ) : (
            // Expanded view - Grouped navigation
            <div className="flex-1 overflow-y-auto">
              {navGroups.map((group, groupIndex) => (
                <div key={group.id} className={cn("px-6 py-4", groupIndex < navGroups.length - 1 && "border-b border-border")}>
                  <h3 className="text-sm font-semibold text-neu-muted uppercase tracking-wide mb-3">
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      
                      return (
                        <NavLink
                          key={item.id}
                          to={item.href}
                          className={cn(
                            'neu-pressable flex items-center gap-3 p-3 text-neu-primary hover:text-primary transition-colors',
                            active && 'bg-primary/10 text-primary font-medium'
                          )}
                        >
                          <Icon size={18} />
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                'text-xs h-4 px-1.5 font-medium',
                                active 
                                  ? 'bg-primary-foreground/90 text-primary' 
                                  : 'bg-destructive/90 text-destructive-foreground'
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile & Actions */}
        <div className={cn("border-t border-border py-4", sidebarCollapsed ? "px-2" : "px-6")}>
          {/* User Profile Card */}
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 p-3 neu-surface rounded-lg mb-3">
              <div className="neu-surface w-10 h-10 rounded-full flex items-center justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs font-bold text-neu-primary">
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neu-primary truncate">
                  {currentUser?.name || 'Admin User'}
                </p>
                <p className="text-xs text-neu-muted truncate">
                  {currentUser?.role || 'Administrator'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="neu-surface w-10 h-10 rounded-full flex items-center justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs font-bold text-neu-primary">
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "neu-pressable flex items-center gap-3 p-3 text-destructive hover:bg-destructive/10 transition-colors",
                  sidebarCollapsed ? "w-full min-h-[44px] justify-center" : "w-full"
                )}
                onClick={handleLogout}
                aria-label="Logout"
              >
                <LogOut size={18} />
                {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              <p>Sign out of admin panel</p>
            </TooltipContent>
          </Tooltip>
        </div>

    </aside>
  );
};

export default AdminSidebar;