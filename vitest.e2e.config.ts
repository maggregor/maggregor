import { defineConfig } from 'vitest/config';
import defaultConfig from './vitest.config';

export default defineConfig({
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    include: ['**/tests/e2e/**/*.test.ts'],
    hookTimeout: 10000,
    testTimeout: 30000,
    setupFiles: [...defaultConfig.test.setupFiles, './tests/e2e/setup.ts'],
  },
});
