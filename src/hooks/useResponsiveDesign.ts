import { useState, useEffect } from 'react';
import { getCurrentDeviceCategory, type DeviceCategory } from '@/utils/mobileBreakpoints';

/**
 * Hook for responsive design utilities and device detection
 */
export const useResponsiveDesign = () => {
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>(() => getCurrentDeviceCategory());
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      setWindowSize({ width: newWidth, height: newHeight });
      setDeviceCategory(getCurrentDeviceCategory());
    };

    // Set initial values
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = deviceCategory === 'mobile';
  const isTablet = deviceCategory === 'tablet';
  const isDesktop = deviceCategory === 'desktop' || deviceCategory === 'large-desktop';
  const isLargeDesktop = deviceCategory === 'large-desktop';

  // Touch device detection
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Responsive grid columns calculation
  const getGridColumns = (mobileColumns = 2, tabletColumns = 3, desktopColumns = 4) => {
    if (isMobile) return mobileColumns;
    if (isTablet) return tabletColumns;
    return desktopColumns;
  };

  // Responsive spacing
  const getSpacing = (mobileSpacing = 4, tabletSpacing = 6, desktopSpacing = 8) => {
    if (isMobile) return mobileSpacing;
    if (isTablet) return tabletSpacing;
    return desktopSpacing;
  };

  // Responsive padding classes
  const getPaddingClasses = (
    mobilePadding = 'p-4',
    tabletPadding = 'md:p-6',
    desktopPadding = 'lg:p-8'
  ) => {
    return `${mobilePadding} ${tabletPadding} ${desktopPadding}`;
  };

  // Responsive text size classes
  const getTextSizeClasses = (
    mobileSize = 'text-sm',
    tabletSize = 'md:text-base',
    desktopSize = 'lg:text-lg'
  ) => {
    return `${mobileSize} ${tabletSize} ${desktopSize}`;
  };

  return {
    deviceCategory,
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isTouchDevice,
    screenWidth: windowSize.width,
    screenHeight: windowSize.height,
    
    // Utility functions
    getGridColumns,
    getSpacing,
    getPaddingClasses,
    getTextSizeClasses,
  };
};