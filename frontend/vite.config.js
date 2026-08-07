import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  build: {
    // pdf worker stays large; warn only for truly unexpected chunks
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('pdfjs-dist') || id.includes('react-pdf')) return 'pdfjs';
          if (id.includes('react-router')) return 'router';
          if (id.includes('lucide-react')) return 'icons';
          if (
            id.includes('react-dom') ||
            id.includes('/react/') ||
            id.includes('\\react\\') ||
            id.includes('scheduler')
          ) {
            return 'react-vendor';
          }
          return undefined;
        },
      },
    },
  },
})
