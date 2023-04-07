import { defineConfig } from 'vitest/config';
import defaultConfig from './vitest.config';

export default defineConfig({
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    include: ['**/tests/integration/**/*.test.ts'],
    hookTimeout: 10000,
    testTimeout: 20000,
  },
});
