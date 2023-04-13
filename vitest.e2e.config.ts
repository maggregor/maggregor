import { defineConfig } from 'vitest/config';
import defaultConfig from './vitest.config';

export default defineConfig({
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    include: ['**/tests/e2e/**/*.test.ts'],
    hookTimeout: 20000,
    testTimeout: 60000,
    setupFiles: ['./tests/e2e/setup.ts'],
  },
});
