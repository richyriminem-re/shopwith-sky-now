import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}'],
        runtimeCaching: [
          // Cache API responses - align with configurable API base URL
          {
            urlPattern: /\/api\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 15, // 15 minutes
              },
            },
          },
          // Cache product images
          {
            urlPattern: /\.(png|jpg|jpeg|webp|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          // Cache fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Shop With Sky',
        short_name: 'ShopWithSky',
        description: 'Premium Fashion & Lifestyle - Luxury and Affordability',
        theme_color: '#101418',
        background_color: '#E9EEF3',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['shopping', 'lifestyle', 'fashion'],
        icons: [
          {
            src: '/lovable-uploads/62770804-21fb-474f-84a8-a4a3f25d70b2.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/lovable-uploads/62770804-21fb-474f-84a8-a4a3f25d70b2.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/lovable-uploads/62770804-21fb-474f-84a8-a4a3f25d70b2.png',
            sizes: '192x192', 
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ],
        shortcuts: [
          {
            name: "Browse Products",
            short_name: "Products", 
            description: "Browse all products",
            url: "/product",
            icons: [{ src: "/lovable-uploads/62770804-21fb-474f-84a8-a4a3f25d70b2.png", sizes: "192x192" }]
          },
          {
            name: "Shopping Cart",
            short_name: "Cart",
            description: "View cart",
            url: "/cart", 
            icons: [{ src: "/lovable-uploads/62770804-21fb-474f-84a8-a4a3f25d70b2.png", sizes: "192x192" }]
          }
        ]
      }
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
}));
