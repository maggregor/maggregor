import { defineConfig } from 'vitest/config';
import AutoImport from 'unplugin-auto-import/vite';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'tests/**/*.test.ts'],
    hookTimeout: 10000,
  },
  plugins: [
    AutoImport({
      imports: ['vitest'],
      dts: true, // generate TypeScript declaration
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@server': resolve(__dirname, 'src/server'),
      '@parser': resolve(__dirname, 'src/parser'),
      '@core': resolve(__dirname, 'src/core'),
    },
  },
});
