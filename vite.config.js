import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'RongRani™',
        short_name: 'RongRani™',
        description: "RongRani™: Bangladesh's favorite online shop for handmade gifts, surprise boxes, jewelry, flowers, and bespoke gifts.",
        theme_color: '#7b1230',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/RongRani-Logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/RongRani-Logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: "Shop Now",
            short_name: "Shop",
            description: "Browse handmade products",
            url: "/shop",
            icons: [{ src: "/RongRani-Logo.png", sizes: "192x192" }]
          },
          {
            name: "My Orders",
            short_name: "Orders",
            description: "Track your orders",
            url: "/profile/orders",
            icons: [{ src: "/RongRani-Logo.png", sizes: "192x192" }]
          },
          {
            name: "Wishlist",
            short_name: "Wishlist",
            description: "View saved items",
            url: "/wishlist",
            icons: [{ src: "/RongRani-Logo.png", sizes: "192x192" }]
          }
        ]
      },
      manifestFilename: 'manifest.json',
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('lucide-react') || id.includes('react-hot-toast') || id.includes('react-icons')) {
              return 'ui';
            }
            if (id.includes('axios') || id.includes('react-helmet-async') || id.includes('i18next')) {
              return 'utils';
            }
            // Group other small deps
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
    cssCodeSplit: true,
    reportCompressedSize: false
  },
  server: {
    port: 5174,
    hmr: {
      clientPort: 5174,
      host: 'localhost',
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/sitemap.xml': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'axios'],
  },
})
