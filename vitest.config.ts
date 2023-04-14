import { UserConfig, defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@server': resolve(__dirname, 'src/server'),
      '@parser': resolve(__dirname, 'src/parser'),
      '@core': resolve(__dirname, 'src/core'),
      '@client': resolve(__dirname, 'src/client'),
    },
  },
}) as UserConfig;
