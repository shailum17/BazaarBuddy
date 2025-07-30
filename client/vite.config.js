import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  return {
    base: '/', // Deployment is at root
    plugins: [react()],
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: 'http://localhost:5000', // Backend API in dev
          changeOrigin: true,
        },
      },
      headers: {
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:;",
      },
    },
    esbuild: {
      target: 'es2020',
      supported: {
        'dynamic-import': true,
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  }
})
