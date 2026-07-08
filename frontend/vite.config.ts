import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['react-icons']
        }
      }
    },
    sourcemap: true,
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/send-quote': 'http://localhost:5000',
      '/download-devis': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
      '/admin/cart': 'http://localhost:5000',
      '/admin/ai-insights': 'http://localhost:5000',
      '/chat': 'http://localhost:5000',
      '/api': 'http://localhost:5000',
    }
  },
  preview: {
    allowedHosts: true,
  },
  define: {
    'process.env': process.env
  },
});
