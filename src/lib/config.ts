/**
 * Application Configuration
 * 
 * Centralized configuration management for environment variables
 * and feature flags. This makes it easy to switch between mock data
 * and real API endpoints.
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 10000,
  },
  
  // Feature Flags
  features: {
    // Using Supabase for data instead of mock data
    useMockData: true, // Keep this true - we've updated the code to use Supabase when this is true
    enableAuth: import.meta.env.VITE_ENABLE_AUTH === 'true',
    
    // Smart Navigation Feature Flags
    smartNavigationPhase: parseInt(import.meta.env.VITE_SMART_NAV_PHASE || '3', 10),
    enableGlobalNavTracking: import.meta.env.VITE_ENABLE_GLOBAL_NAV_TRACKING !== 'false',
    enableIntentTracking: import.meta.env.VITE_ENABLE_INTENT_TRACKING !== 'false',
    enablePrefetch: import.meta.env.VITE_ENABLE_PREFETCH !== 'false',
    enableEnhancedRecovery: import.meta.env.VITE_ENABLE_ENHANCED_RECOVERY !== 'false',
  },
  
  // Environment
  env: {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },
};

export default config;