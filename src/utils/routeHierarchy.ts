/**
 * Route hierarchy mapping for smart contextual fallbacks
 * This defines the logical navigation hierarchy for the application
 */

export interface RouteMapping {
  route: string;
  parent?: string;
  fallback: string;
  description: string;
}

export const routeHierarchy: RouteMapping[] = [
  // Home
  { route: '/', fallback: '/', description: 'Home page' },
  
  // Products
  { route: '/product', fallback: '/', description: 'All products' },
  { route: '/product/:handle', parent: '/product', fallback: '/product', description: 'Product detail page' },
  
  // Shopping Flow
  { route: '/cart', fallback: '/product', description: 'Shopping cart' },
  { route: '/checkout', parent: '/cart', fallback: '/cart', description: 'Checkout process' },
  { route: '/checkout-enhanced', parent: '/cart', fallback: '/cart', description: 'Enhanced checkout' },
  { route: '/checkout-hybrid', parent: '/cart', fallback: '/cart', description: 'Hybrid checkout' },
  { route: '/order-confirmation', parent: '/checkout', fallback: '/orders', description: 'Order confirmation' },
  
  // Account
  { route: '/account', fallback: '/', description: 'User account' },
  { route: '/orders', parent: '/account', fallback: '/account', description: 'Order history' },
  { route: '/wishlist', parent: '/account', fallback: '/account', description: 'User wishlist' },
  { route: '/notifications', parent: '/account', fallback: '/account', description: 'Notifications' },
  
  // Auth
  { route: '/login', fallback: '/', description: 'Login page' },
  { route: '/forgot-password', parent: '/login', fallback: '/login', description: 'Password recovery' },
  
  // Support
  { route: '/help', fallback: '/', description: 'Help center' },
  { route: '/contact', parent: '/help', fallback: '/help', description: 'Contact support' },
  
  // Legal
  { route: '/privacy', fallback: '/', description: 'Privacy policy' },
  { route: '/terms', fallback: '/', description: 'Terms of service' },
  
  // System
  { route: '/offline', fallback: '/', description: 'Offline page' },
  { route: '/404', fallback: '/', description: 'Page not found' },
];

/**
 * Get smart fallback route based on current route and breadcrumb context
 */
export const getSmartFallback = (currentRoute: string, breadcrumbContext?: string[]): string => {
  // Remove query parameters and hash
  const cleanRoute = currentRoute.split('?')[0].split('#')[0];
  
  // Find exact match
  let mapping = routeHierarchy.find(r => r.route === cleanRoute);
  
  // If no exact match, try partial matching for dynamic routes
  if (!mapping) {
    mapping = routeHierarchy.find(r => {
      // Handle dynamic routes like /product/:id
      if (r.route.includes(':')) {
        const routeParts = r.route.split('/');
        const cleanParts = cleanRoute.split('/');
        
        if (routeParts.length === cleanParts.length) {
          return routeParts.every((part, index) => 
            part.startsWith(':') || part === cleanParts[index]
          );
        }
      }
      
      // Handle prefix matching for nested routes
      if (cleanRoute.startsWith(r.route + '/') || cleanRoute.startsWith(r.route)) {
        return true;
      }
      
      return false;
    });
  }
  
  if (mapping) {
    // If there's a parent route, try to use it
    if (mapping.parent) {
      return mapping.parent;
    }
    
    // Otherwise use the defined fallback
    return mapping.fallback;
  }
  
  // Use breadcrumb context if available
  if (breadcrumbContext && breadcrumbContext.length > 1) {
    const parentBreadcrumb = breadcrumbContext[breadcrumbContext.length - 2];
    const parentMapping = routeHierarchy.find(r => 
      r.description.toLowerCase().includes(parentBreadcrumb.toLowerCase())
    );
    if (parentMapping) {
      return parentMapping.route;
    }
  }
  
  // Final fallback
  return '/';
};

/**
 * Get route priority for navigation analytics
 */
export const getRoutePriority = (route: string): 'critical' | 'high' | 'medium' | 'low' => {
  const cleanRoute = route.split('?')[0].split('#')[0];
  
  // Critical routes for business
  if (['/checkout', '/checkout-enhanced', '/checkout-hybrid', '/order-confirmation'].includes(cleanRoute)) {
    return 'critical';
  }
  
  // High priority shopping flow
  if (['/product', '/cart'].includes(cleanRoute) || cleanRoute.startsWith('/product/')) {
    return 'high';
  }
  
  // Medium priority user features
  if (['/account', '/orders', '/wishlist', '/login'].includes(cleanRoute)) {
    return 'medium';
  }
  
  // Low priority informational
  return 'low';
};

/**
 * Check if route requires cart items
 */
export const requiresCart = (route: string): boolean => {
  const cleanRoute = route.split('?')[0].split('#')[0];
  return ['/checkout', '/checkout-enhanced', '/checkout-hybrid'].includes(cleanRoute);
};

/**
 * Check if route requires authentication
 */
export const requiresAuth = (route: string): boolean => {
  const cleanRoute = route.split('?')[0].split('#')[0];
  return ['/account', '/orders', '/wishlist', '/notifications'].includes(cleanRoute);
};
