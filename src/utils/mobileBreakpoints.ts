/**
 * Mobile breakpoint utilities for consistent cross-device testing
 */

export const BREAKPOINTS = {
  MOBILE_MIN: 320,
  MOBILE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024,
  DESKTOP_MAX: 1279,
  LARGE_DESKTOP_MIN: 1280,
} as const;

export const DEVICE_CATEGORIES = {
  MOBILE: 'mobile',
  TABLET: 'tablet', 
  DESKTOP: 'desktop',
  LARGE_DESKTOP: 'large-desktop',
} as const;

export type DeviceCategory = typeof DEVICE_CATEGORIES[keyof typeof DEVICE_CATEGORIES];

/**
 * Get current device category based on window width
 */
export const getCurrentDeviceCategory = (): DeviceCategory => {
  if (typeof window === 'undefined') return DEVICE_CATEGORIES.DESKTOP;
  
  const width = window.innerWidth;
  
  if (width <= BREAKPOINTS.MOBILE_MAX) return DEVICE_CATEGORIES.MOBILE;
  if (width <= BREAKPOINTS.TABLET_MAX) return DEVICE_CATEGORIES.TABLET;
  if (width <= BREAKPOINTS.DESKTOP_MAX) return DEVICE_CATEGORIES.DESKTOP;
  return DEVICE_CATEGORIES.LARGE_DESKTOP;
};

/**
 * Check if current device is mobile
 */
export const isMobileDevice = (): boolean => {
  return getCurrentDeviceCategory() === DEVICE_CATEGORIES.MOBILE;
};

/**
 * Check if current device is tablet
 */
export const isTabletDevice = (): boolean => {
  return getCurrentDeviceCategory() === DEVICE_CATEGORIES.TABLET;
};

/**
 * Check if current device is desktop or larger
 */
export const isDesktopDevice = (): boolean => {
  const category = getCurrentDeviceCategory();
  return category === DEVICE_CATEGORIES.DESKTOP || category === DEVICE_CATEGORIES.LARGE_DESKTOP;
};

/**
 * Get responsive class names based on device category
 */
export const getResponsiveClasses = (
  mobile: string,
  tablet?: string,
  desktop?: string
): string => {
  const category = getCurrentDeviceCategory();
  
  switch (category) {
    case DEVICE_CATEGORIES.MOBILE:
      return mobile;
    case DEVICE_CATEGORIES.TABLET:
      return tablet || mobile;
    case DEVICE_CATEGORIES.DESKTOP:
    case DEVICE_CATEGORIES.LARGE_DESKTOP:
      return desktop || tablet || mobile;
    default:
      return mobile;
  }
};

/**
 * Test viewport dimensions for different device categories
 */
export const TEST_VIEWPORTS = {
  MOBILE_SMALL: { width: 320, height: 568 }, // iPhone SE
  MOBILE_MEDIUM: { width: 375, height: 667 }, // iPhone 8
  MOBILE_LARGE: { width: 414, height: 896 }, // iPhone 11 Pro Max
  TABLET_PORTRAIT: { width: 768, height: 1024 }, // iPad
  TABLET_LANDSCAPE: { width: 1024, height: 768 }, // iPad landscape
  DESKTOP_SMALL: { width: 1024, height: 768 },
  DESKTOP_MEDIUM: { width: 1280, height: 720 },
  DESKTOP_LARGE: { width: 1440, height: 900 },
  DESKTOP_XL: { width: 1920, height: 1080 },
} as const;