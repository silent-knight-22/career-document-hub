import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es',
  },
  // Modern evergreen browsers (Chrome/Edge/Firefox/Safari last 2 years).
  // Requires Web Crypto (PBKDF2), ES modules, and AbortController.
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1100,
    modulePreload: {
      resolveDependencies(filename, deps) {
        return deps.filter(
          (dep) =>
            !dep.includes('pdfjs') &&
            !dep.includes('pdf.worker') &&
            !dep.includes('pdfWorker'),
        );
      },
    },
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
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
})
