import { defineConfig } from 'vitest/config';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'e2e/**/*.test.ts'],
    hookTimeout: 10000,
  },
  plugins: [
    AutoImport({
      imports: ['vitest'],
      dts: true, // generate TypeScript declaration
    }),
  ],
});
