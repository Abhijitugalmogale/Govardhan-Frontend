import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Dairy Farm Manager',
        short_name: 'DairyManager',
        description: 'Manage cow pregnancy records, milk, and finance',
        theme_color: '#86efac',
        icons: [] // would normally have 192 and 512 icons, empty for mock
      }
    })
  ],
})
