import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // --- AÑADE ESTA SECCIÓN ---
  server: {
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:8888', // Puerto por defecto de 'netlify dev'
        changeOrigin: true,
      },
    },
  },
  // --- FIN DE LA SECCIÓN AÑADIDA ---
})
