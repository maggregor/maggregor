import { mergeConfig } from 'vitest/config';
import commonConfig from './vitest.config';

export default mergeConfig(commonConfig, {
  test: {
    include: ['**/tests/integration/**/*.test.ts'],
    hookTimeout: 10000,
    testTimeout: 20000,
  },
});
