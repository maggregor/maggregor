import { UserConfigExport, mergeConfig } from 'vitest/config';
import commonConfig from './vitest.config';

export default mergeConfig(commonConfig, {
  test: {
    include: ['**/tests/integration/**/*.test.ts'],
    hookTimeout: 180000,
    testTimeout: 20000,
    coverage: {
      reportsDirectory: './coverage/integration',
    },
  },
} as UserConfigExport);
