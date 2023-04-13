import { defineConfig } from 'vitest/config';
import defaultConfig from './vitest.config';

export default defineConfig({
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    include: ['**/tests/e2e/**/*.test.ts'],
    hookTimeout: 200000,
    testTimeout: 600000,
    setupFiles: ['./tests/e2e/setup.ts'],
  },
});
