import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'

const target = process.env.BACKEND_URL ?? 'http://localhost:4000'

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      manifest: {
        name: 'Argus',
        short_name: 'Argus',
        display: 'standalone',
        theme_color: '#283593',
        background_color: '#1f1f1f',
        start_url: '.',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64',
            type: 'image/x-icon',
          },
          {
            src: 'logo192.png',
            type: 'image/png',
            sizes: '192x192',
          },
          {
            src: 'logo512.png',
            type: 'image/png',
            sizes: '512x512',
          },
          {
            src: 'logo192_maskable.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'maskable',
          },
          {
            src: 'logo512_maskable.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  base: './',
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/ajax': {
        target,
        changeOrigin: true,
      },
    },
  },
})
