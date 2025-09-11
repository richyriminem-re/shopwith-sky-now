import React from 'react';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';

interface ResponsiveGridProps {
  children: React.ReactNode;
  minItemWidth?: string; // CSS minmax() compatible value
  gap?: string; // Tailwind gap class
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  largeDesktopColumns?: number;
  className?: string;
}

export function ResponsiveGrid({
  children,
  minItemWidth = '280px',
  gap = 'gap-4',
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  largeDesktopColumns = 4,
  className = '',
}: ResponsiveGridProps) {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsiveDesign();

  // Calculate grid template columns based on screen size
  const getGridStyle = (): React.CSSProperties => {
    let columns: number;
    
    if (isMobile) {
      columns = mobileColumns;
    } else if (isTablet) {
      columns = tabletColumns;
    } else if (isLargeDesktop) {
      columns = largeDesktopColumns;
    } else {
      columns = desktopColumns;
    }

    // Use CSS Grid with auto-fit for better responsiveness
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(min(${minItemWidth}, 100%), 1fr))`,
      gap: 'var(--grid-gap, 1rem)',
    };
  };

  return (
    <div 
      className={`responsive-grid ${gap} ${className}`}
      style={getGridStyle()}
    >
      {children}
    </div>
  );
}

// Preset grid configurations for common use cases
export const ProductGrid = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <ResponsiveGrid
    minItemWidth="250px"
    gap="gap-4 md:gap-6"
    mobileColumns={2}
    tabletColumns={3}
    desktopColumns={4}
    largeDesktopColumns={5}
    className={className}
  >
    {children}
  </ResponsiveGrid>
);

export const MetricsGrid = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <ResponsiveGrid
    minItemWidth="200px"
    gap="gap-3 md:gap-4 lg:gap-6"
    mobileColumns={1}
    tabletColumns={2}
    desktopColumns={4}
    largeDesktopColumns={4}
    className={className}
  >
    {children}
  </ResponsiveGrid>
);

export const DashboardGrid = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <ResponsiveGrid
    minItemWidth="300px"
    gap="gap-4 lg:gap-6"
    mobileColumns={1}
    tabletColumns={1}
    desktopColumns={2}
    largeDesktopColumns={2}
    className={className}
  >
    {children}
  </ResponsiveGrid>
);