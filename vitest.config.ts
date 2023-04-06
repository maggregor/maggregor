import { UserConfig, defineConfig } from 'vitest/config';
import AutoImport from 'unplugin-auto-import/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['vitest'],
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@server': resolve(__dirname, 'src/server'),
      '@parser': resolve(__dirname, 'src/parser'),
      '@core': resolve(__dirname, 'src/core'),
    },
  },
}) as UserConfig;
