import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served by GitHub Pages under /portfolio/.
export default defineConfig({
  base: '/portfolio/',
  plugins: [react()],
  build: { target: 'es2022', cssCodeSplit: false },
});
