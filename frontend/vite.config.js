import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to backend server in development
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/analyze': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Proxy /dbp/* API calls to backend
      // The bypass function prevents proxying the exact /dbp path (frontend route)
      '/dbp': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        bypass: (req) => {
          // If the path is exactly /dbp or /dbp/, don't proxy (let React Router handle it)
          if (req.url === '/dbp' || req.url === '/dbp/') {
            return req.url; // Return the path to bypass proxy
          }
          // For all other /dbp/* paths, proxy to backend
          return null;
        },
      },
    },
  },
})
