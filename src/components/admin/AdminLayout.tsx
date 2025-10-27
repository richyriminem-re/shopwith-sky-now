import { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/lib/adminStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Package, LogOut, Home, Truck, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
const AdminLayout = () => {
  const {
    isAuthenticated,
    setSession,
    logout,
    sidebarOpen,
    setSidebarOpen
  } = useAdminStore();
  const navigate = useNavigate();
  useEffect(() => {
    // Set up auth state listener
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate('/admin/login');
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [setSession, navigate]);
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };
  const NavLinks = ({
    mobile = false
  }: {
    mobile?: boolean;
  }) => <nav className={cn("space-y-2", mobile && "mt-8")}>
      <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => {
      navigate('/admin');
      if (mobile) setSidebarOpen(false);
    }}>
        <Home className="h-5 w-5" />
        Dashboard
      </Button>
      
      <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => {
      navigate('/admin/products');
      if (mobile) setSidebarOpen(false);
    }}>
        <Package className="h-5 w-5" />
        Products
      </Button>

      <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => {
      navigate('/admin/hero-slides');
      if (mobile) setSidebarOpen(false);
    }}>
        <Package className="h-5 w-5" />
        Hero Slides
      </Button>

      <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => {
      navigate('/admin/shipping-promos');
      if (mobile) setSidebarOpen(false);
    }}>
        <Truck className="h-5 w-5" />
        Shipping & Promos
      </Button>

      <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => {
      navigate('/admin/faqs');
      if (mobile) setSidebarOpen(false);
    }}>
        <HelpCircle className="h-5 w-5" />
        FAQs
      </Button>

      <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => {
      navigate('/admin/site-settings');
      if (mobile) setSidebarOpen(false);
    }}>
        <Settings className="h-5 w-5" />
        Site Settings
      </Button>
    </nav>;
  return <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center gap-2 mb-8">
                  <Package className="h-6 w-6" />
                  <span className="text-lg font-bold">Admin</span>
                </div>
                <NavLinks mobile />
                <div className="mt-auto space-y-4">
                  <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => navigate('/')}>
                    Back to Store
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <h1 className="text-lg font-semibold">Admin</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r h-screen sticky top-0">
          <div className="p-6 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center gap-2 mb-8">
              <Package className="h-6 w-6" />
              <span className="text-xl font-bold">Admin</span>
            </div>
            <NavLinks />
            <div className="mt-8 space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => navigate('/')}>
                Back to Store
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>;
};
export default AdminLayout;