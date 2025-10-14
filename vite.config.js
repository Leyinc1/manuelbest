import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
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
      '/api': {
        target: 'http://localhost:5009',
        changeOrigin: true,
      },
    },
  },
  // --- FIN DE LA SECCIÓN AÑADIDA ---
  test: {
    environment: 'jsdom', // Simulate browser environment
    globals: true, // Make Vitest APIs globally available
  },
})
