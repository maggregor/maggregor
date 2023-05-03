import { UserConfigExport, mergeConfig } from 'vitest/config';
import commonConfig from './vitest.config';

export default mergeConfig(commonConfig, {
  test: {
    include: ['**/tests/unit/**/*.test.ts'],
    hookTimeout: 2000,
    testTimeout: 5000,
    coverage: {
      reportsDirectory: './coverage/unit',
    },
  },
} as UserConfigExport);
