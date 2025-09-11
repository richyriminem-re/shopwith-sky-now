import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useNavigationMonitor } from '@/utils/navigationMonitor';

/**
 * Enhanced Link component that captures navigation timing
 * Drop-in replacement for React Router Link
 */
export interface AppLinkProps extends LinkProps {
  children: React.ReactNode;
}

const AppLink: React.FC<AppLinkProps> = ({ children, onClick, ...props }) => {
  const { startNavigationTiming } = useNavigationMonitor();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Extract destination route for analytics
    const destinationRoute = typeof props.to === 'string' ? props.to : props.to.pathname || '/';
    
    // Start navigation timing with destination route
    startNavigationTiming(destinationRoute, 'link');
    
    // Call original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Link 
      {...props} 
      onClick={handleClick}
      data-navigation="true"
    >
      {children}
    </Link>
  );
};

export default AppLink;