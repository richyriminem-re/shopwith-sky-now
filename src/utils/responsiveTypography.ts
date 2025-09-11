// Fluid typography utilities using clamp() for smooth scaling
export const fluidTypography = {
  // Display text - for hero sections and large headlines
  'text-display': 'clamp(2rem, 4vw + 1rem, 4rem)', // 32px to 64px
  'text-display-sm': 'clamp(1.75rem, 3.5vw + 0.75rem, 3rem)', // 28px to 48px
  
  // Headings - semantic hierarchy maintained across breakpoints
  'text-h1': 'clamp(1.5rem, 2.5vw + 1rem, 2.5rem)', // 24px to 40px
  'text-h2': 'clamp(1.25rem, 2vw + 0.75rem, 2rem)', // 20px to 32px
  'text-h3': 'clamp(1.125rem, 1.5vw + 0.5rem, 1.75rem)', // 18px to 28px
  'text-h4': 'clamp(1rem, 1vw + 0.5rem, 1.5rem)', // 16px to 24px
  'text-h5': 'clamp(0.9375rem, 0.5vw + 0.75rem, 1.25rem)', // 15px to 20px
  'text-h6': 'clamp(0.875rem, 0.25vw + 0.75rem, 1.125rem)', // 14px to 18px
  
  // Body text - optimized for readability
  'text-body-lg': 'clamp(1rem, 0.5vw + 0.75rem, 1.125rem)', // 16px to 18px
  'text-body': 'clamp(0.875rem, 0.25vw + 0.75rem, 1rem)', // 14px to 16px
  'text-body-sm': 'clamp(0.8125rem, 0.125vw + 0.75rem, 0.875rem)', // 13px to 14px
  
  // UI text - for buttons, labels, captions
  'text-caption': 'clamp(0.75rem, 0.125vw + 0.675rem, 0.8125rem)', // 12px to 13px
  'text-micro': 'clamp(0.6875rem, 0.125vw + 0.625rem, 0.75rem)', // 11px to 12px
} as const;

// Line height ratios for different text types
export const lineHeightScale = {
  tight: '1.2',
  normal: '1.4',
  relaxed: '1.6',
  loose: '1.8',
} as const;

// Generate responsive text classes
export const getResponsiveTextClass = (
  base: keyof typeof fluidTypography,
  lineHeight: keyof typeof lineHeightScale = 'normal'
) => ({
  fontSize: fluidTypography[base],
  lineHeight: lineHeightScale[lineHeight],
});

// Responsive spacing utilities using clamp()
export const responsiveSpacing = {
  'space-xs': 'clamp(0.25rem, 0.5vw, 0.5rem)', // 4px to 8px
  'space-sm': 'clamp(0.5rem, 1vw, 0.75rem)', // 8px to 12px
  'space-md': 'clamp(0.75rem, 1.5vw, 1rem)', // 12px to 16px
  'space-lg': 'clamp(1rem, 2vw, 1.5rem)', // 16px to 24px
  'space-xl': 'clamp(1.5rem, 3vw, 2rem)', // 24px to 32px
  'space-2xl': 'clamp(2rem, 4vw, 3rem)', // 32px to 48px
  'space-3xl': 'clamp(2.5rem, 5vw, 4rem)', // 40px to 64px
} as const;

// Container constraints for optimal reading
export const containerConstraints = {
  'prose-width': 'min(65ch, 100% - 2rem)', // Optimal reading width
  'content-width': 'min(1200px, 100% - 2rem)', // Main content container
  'wide-width': 'min(1440px, 100% - 2rem)', // Wide layouts
  'narrow-width': 'min(480px, 100% - 2rem)', // Forms and narrow content
} as const;

// Touch-friendly sizing
export const touchTargets = {
  'tap-sm': '44px', // Minimum touch target
  'tap-md': '48px', // Comfortable touch target
  'tap-lg': '52px', // Large touch target
} as const;

// Responsive border radius
export const responsiveBorderRadius = {
  'radius-xs': 'clamp(2px, 0.5vw, 4px)',
  'radius-sm': 'clamp(4px, 1vw, 6px)',
  'radius-md': 'clamp(6px, 1.5vw, 8px)',
  'radius-lg': 'clamp(8px, 2vw, 12px)',
  'radius-xl': 'clamp(12px, 3vw, 16px)',
} as const;

// CSS custom properties for dynamic theming
export const generateResponsiveCSS = () => `
  :root {
    /* Fluid Typography */
    ${Object.entries(fluidTypography).map(([key, value]) => 
      `--${key}: ${value};`
    ).join('\n    ')}
    
    /* Responsive Spacing */
    ${Object.entries(responsiveSpacing).map(([key, value]) => 
      `--${key}: ${value};`
    ).join('\n    ')}
    
    /* Container Constraints */
    ${Object.entries(containerConstraints).map(([key, value]) => 
      `--${key}: ${value};`
    ).join('\n    ')}
    
    /* Touch Targets */
    ${Object.entries(touchTargets).map(([key, value]) => 
      `--${key}: ${value};`
    ).join('\n    ')}
    
    /* Responsive Border Radius */
    ${Object.entries(responsiveBorderRadius).map(([key, value]) => 
      `--${key}: ${value};`
    ).join('\n    ')}
  }
`;