import { UserConfigExport, mergeConfig } from 'vitest/config';
import commonConfig from './vitest.config';

export default mergeConfig(commonConfig, {
  test: {
    include: ['**/tests/e2e/**/*.test.ts'],
    hookTimeout: 20000,
    testTimeout: 60000,
    setupFiles: ['./tests/e2e/setup-all.ts'],
  },
} as UserConfigExport);
