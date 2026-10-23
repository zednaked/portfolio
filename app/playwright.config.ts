import { defineConfig, devices } from '@playwright/test';

// Runs against the production build, served the way GitHub Pages serves it.
// CHROMIUM_PATH lets a machine use its system Chromium instead of a download.
const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://127.0.0.1:4173/portfolio/', launchOptions: { executablePath } },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:4173/portfolio/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
    { name: 'reduced', use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' } },
  ],
});
