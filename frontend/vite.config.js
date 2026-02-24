import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'pwa-512x512.png', 'bg.jpg', 'bg.png'],
      manifest: {
        name: 'Coaching App',
        short_name: 'Coaching',
        description: 'Fitness coaching app for coaches and clients',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#313851',
        background_color: '#313851',
        categories: ['fitness', 'health', 'lifestyle'],
        prefer_related_applications: false,
        screenshots: [
          {
            src: 'pwa-512x512.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ],
        icons: [
          {
            src: 'pwa-512x512.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(jpg|jpeg|png|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /\/bg\.png$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'background-images',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ],
})
