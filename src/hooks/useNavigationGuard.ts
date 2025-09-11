import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '@/lib/store';

interface NavigationGuardOptions {
  requiresCart?: boolean;
  requiresAuth?: boolean;
  redirectTo?: string;
}

/**
 * Navigation guard hook to protect routes based on conditions
 */
export const useNavigationGuard = (options: NavigationGuardOptions = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCartStore();
  
  const {
    requiresCart = false,
    requiresAuth = false,
    redirectTo = '/'
  } = options;

  useEffect(() => {
    // Skip guard if we're already on the redirect path to prevent loops
    if (location.pathname === redirectTo) return;

    let shouldRedirect = false;
    let redirectPath = redirectTo;

    // Check if cart is required but empty
    if (requiresCart && items.length === 0) {
      shouldRedirect = true;
      redirectPath = '/cart';
    }

    // Check if auth is required (future implementation)
    if (requiresAuth) {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        shouldRedirect = true;
        redirectPath = '/login';
      }
    }

    if (shouldRedirect) {
      navigate(redirectPath, { replace: true });
    }
  }, [items.length, navigate, location.pathname, requiresCart, requiresAuth, redirectTo]);

  return {
    hasCart: items.length > 0,
    isAuthenticated: !!localStorage.getItem('auth_token'),
  };
};

/**
 * Hook to prevent navigation when form has unsaved changes
 */
export const useUnsavedChangesGuard = (hasUnsavedChanges: boolean, message?: string) => {
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message || 'You have unsaved changes. Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);
};