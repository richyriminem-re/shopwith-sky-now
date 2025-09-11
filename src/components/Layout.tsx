import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import CallBar from './CallBar';
import NetworkStatus from './NetworkStatus';
import PWAInstallPrompt from './PWAInstallPrompt';
import CircuitBreakerDashboard from './CircuitBreakerDashboard';
import ServiceStatusIndicator from './ServiceStatusIndicator';

const Layout = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const isCheckout = location.pathname === '/checkout';
  const isCheckoutHybrid = location.pathname === '/checkout-hybrid';
  const isCart = location.pathname === '/cart';
  const isHome = location.pathname === '/';

  return (
    <div className={isLogin ? 'min-h-screen' : 'min-h-screen bg-neu'}>
      {/* Skip to content link */}
      <a 
        href="#main-content" 
        className="skip-link absolute -top-40 left-6 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-md focus:top-6 transition-all duration-200"
        tabIndex={0}
      >
        Skip to content
      </a>

      {!isLogin && !isCheckout && !isCheckoutHybrid && (
        <>
          <Header />
          {isHome && <CallBar />}
        </>
      )}
      
      {/* Service Status Indicator for API Issues */}
      {!isLogin && <ServiceStatusIndicator />}
      
      <main 
        id="main-content" 
        role="main" 
        className={isLogin ? 'relative' : 'relative pt-2'}
      >
        <Outlet />
      </main>
      
      {/* Global UI Components */}
      <NetworkStatus />
      <PWAInstallPrompt />
      
      {/* Circuit Breaker Dashboard (Development Only) */}
      <CircuitBreakerDashboard />
    </div>
  );
};

export default Layout;