import { defineConfig } from 'vitest/config';
import defaultConfig from './vitest.config';

export default defineConfig({
  ...defaultConfig,
  test: {
    ...defaultConfig.test,
    include: ['**/tests/unit/**/*.test.ts'],
    hookTimeout: 2000,
    testTimeout: 5000,
  },
});
