import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeCompatibility } from './utils/compatibility'
import '@fortawesome/fontawesome-free/css/all.css'
import { preloadHeroImages } from './hooks/useImagePreloader'
import { initializePerformanceOptimizations } from './utils/performanceOptimizations'
import { AdvancedPWAProvider } from '@/components/AdvancedPWAProvider'

// Initialize compatibility features first
initializeCompatibility().then(() => {
  if (import.meta.env.DEV) {
    console.log('App initializing at:', window.location.pathname);
    console.log('Base URL:', window.location.origin);
  }
  
  // Initialize performance optimizations
  initializePerformanceOptimizations();

  // Preload critical assets with delay to reduce startup violations
  setTimeout(() => {
    preloadHeroImages();
  }, 1000);

  createRoot(document.getElementById("root")!).render(
    <App />
  );
}).catch(error => {
  console.error('Failed to initialize app:', error);
});
