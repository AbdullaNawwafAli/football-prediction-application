import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    devtools(),
    tailwindcss(),
    viteReact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['worldcup.png', 'robots.txt', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Prediction',
        short_name: 'Prediction',
        description:
          'Predict match scores, group standings, and knockouts with your team.',
        theme_color: '#328f97',
        background_color: '#e7f3ec',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'worldcup.png',
            sizes: 'any',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'worldcup.png',
            sizes: 'any',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  server: {
    port: 3000,
    strictPort: true,
  },
})
