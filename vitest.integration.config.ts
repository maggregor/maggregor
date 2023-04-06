import { defineConfig } from 'vitest/config';
import defaultConfig from './vitest.config';

export default defineConfig({
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    include: ['**/tests/integration/**/*.test.ts'],
    hookTimeout: 5000,
    testTimeout: 10000,
  },
});
