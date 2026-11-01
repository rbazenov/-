import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = path.resolve(appDir, '../..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@content': path.resolve(projectRoot, 'content'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['.e2b.app', 'localhost'],
    fs: {
      allow: [projectRoot],
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: ['.e2b.app', 'localhost'],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
