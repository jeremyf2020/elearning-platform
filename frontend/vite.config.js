import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000, 
    watch: {
      usePolling: true
    }
  },
  test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js', 
      css: true,
    },
})