/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served by GitHub Pages under /portfolio/.
export default defineConfig({
  base: '/portfolio/',
  plugins: [react()],
  build: { target: 'es2022', cssCodeSplit: false },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
