import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Repo is served from https://amarchanh.github.io/food-track/, so all
// built asset URLs must be prefixed with the repo name.
const BASE = '/food-track/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'favicon-32.png'],
      manifest: {
        id: BASE,
        name: 'FoodTrack — Seguimiento de calorías',
        short_name: 'FoodTrack',
        description: 'Registra tus comidas, calorías y macros, y aprovecha lo que tienes en la nevera.',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        background_color: '#f9f9f7',
        theme_color: '#16a34a',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
})
