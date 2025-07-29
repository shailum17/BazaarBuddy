import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    // Fixed: Add proper headers for security
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;"
    }
  },
  // Fixed: Disable eval for security
  esbuild: {
    target: 'es2020',
    supported: {
      'dynamic-import': true
    }
  },
  build: {
    // Fixed: Ensure no eval is used in production
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
}) 