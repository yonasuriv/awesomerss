import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/rss-reader/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Ensure feed files are served correctly
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
});