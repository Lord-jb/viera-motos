import { resolve } from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        modelo: resolve(__dirname, 'modelo.html'),
        testDrive: resolve(__dirname, 'test-drive.html'),
        financiamento: resolve(__dirname, 'financiamento.html'),
        servicos: resolve(__dirname, 'servicos.html'),
        sobre: resolve(__dirname, 'sobre.html'),
        consulta: resolve(__dirname, 'consulta.html'),
        admin: resolve(__dirname, 'admin/admin.html')
      }
    }
  },
  plugins: [
    VitePWA({
      injectRegister: null,
      manifest: {
        name: 'Avelloz Motos - Viera Moto Center',
        short_name: 'Avelloz',
        description: 'Concessionária Avelloz Motos em Marabá. Encontre seu modelo.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#FF6600',
        icons: [
          { src: '/assets/images/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
          { src: '/assets/images/icons/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,webp}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-images-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ]
});
