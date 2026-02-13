/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  base: '/chile-map/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'leaflet': ['leaflet', 'react-leaflet'],
          'trip-data': ['./src/data/trip-data.json', './src/data/facts.json'],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'offline.html'],
      workbox: {
        // Precache all static assets including offline page
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webp,woff2}'],
        // Offline fallback for navigation requests
        navigateFallback: '/chile-map/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/chile-map\/offline\.html$/],
        runtimeCaching: [
          {
            // CARTO Dark Matter tiles — primary map provider (free, no API key)
            urlPattern: /^https:\/\/.*\.basemaps\.cartocdn\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'carto-tiles-v2',
              expiration: {
                maxEntries: 10000,               // ~250 MB at 25KB/tile — covers z5-14 for route
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days (covers the entire trip)
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Google Fonts (if any)
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Runtime images (if any loaded dynamically)
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Runtime fonts (if any loaded dynamically)
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Chile Road Trip 2025',
        short_name: 'Chile Trip',
        description: 'Interactive map for our Chile adventure',
        theme_color: '#0f0f14',
        background_color: '#0f0f14',
        display: 'standalone',
        orientation: 'any',
        start_url: '/chile-map/',
        scope: '/chile-map/',
        id: '/chile-map/',
        categories: ['travel', 'navigation'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
