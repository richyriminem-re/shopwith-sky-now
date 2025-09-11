import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAdminStore } from '@/lib/adminStore';
import AdminSidebar from './AdminSidebar';
import { cn } from '@/lib/utils';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Menu, X, Bell } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, sidebarCollapsed, setSidebarCollapsed } = useAdminStore();
  const { isMobile } = useResponsiveDesign();
  const location = useLocation();

  // Auto-collapse sidebar on mobile - only run once when mobile state changes
  useEffect(() => {
    if (isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]); // Removed sidebarCollapsed and setSidebarCollapsed from deps

  // Auto-collapse sidebar when navigating on mobile - only run when path changes
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname]); // Removed isMobile and setSidebarCollapsed from deps

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex">
      {/* Mobile Backdrop */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
        isMobile 
          ? "ml-0" 
          : sidebarCollapsed 
            ? "ml-16" 
            : "ml-64"
      )}>
        {/* Mobile Header */}
        {isMobile && (
          <TooltipProvider>
            <header className="neu-floating fixed top-0 z-50 w-full px-4 py-2 backdrop-blur-sm flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSidebarCollapsed(false)}
                      className="neu-icon-button min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Open menu"
                    >
                      <Menu size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open navigation menu</p>
                  </TooltipContent>
                </Tooltip>
              
              <Link to="/admin" className="flex items-center">
                <img 
                  src="/lovable-uploads/e056f700-4487-46d1-967e-39e0eb41e922.png" 
                  alt="Shop with Sky" 
                  className="h-10 w-auto cursor-pointer"
                />
              </Link>
            </div>
              
              <div className="flex items-center gap-2">
                <ThemeToggle />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="neu-icon-button min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Notifications"
                    >
                      <Bell size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View notifications</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </header>
          </TooltipProvider>
        )}

        {/* Page Content */}
        <main className={cn("flex-1 overflow-auto", isMobile && "pt-16")}>
          <div className="container-wide p-fluid-md space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;