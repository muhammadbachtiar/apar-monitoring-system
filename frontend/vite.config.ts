import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
            react(),
            VitePWA({
              srcDir: 'public',
              filename: 'sw.js',
              workbox: {
                globPatterns: ['**/*'],
                swDest: 'dist/sw.js', 
              },
            }),
            ],
})
