import { UserConfigExport, mergeConfig } from 'vitest/config';
import commonConfig from './vitest.config';

export default mergeConfig(commonConfig, {
  test: {
    include: ['**/tests/e2e/**/*.test.ts'],
    hookTimeout: 30000,
    testTimeout: 60000,
  },
} as UserConfigExport);
