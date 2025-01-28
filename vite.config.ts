import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/awesomerss/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      external: ['module-name-to-externalize'] // Replace 'module-name-to-externalize' with the actual module name
    }
  }
});
