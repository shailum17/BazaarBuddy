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
          "default-src 'self'; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' ws: wss: http: https:;",
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
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@mui/material', '@mui/icons-material', 'lucide-react'],
            utils: ['axios', 'socket.io-client', 'react-hot-toast']
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  }
})
