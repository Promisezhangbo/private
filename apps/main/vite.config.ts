import { appManualChunks } from '@packages/vite-build-utils';
import react from '@vitejs/plugin-react';
import dayjs from 'dayjs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig((config) => {
  const { mode } = config;
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = env.NODE_ENV === 'development';

  console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'), '000000000');

  return {
    base: isDev ? '/' : '/main/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@style-config': path.resolve(__dirname, '../../packages/style-config/scss'),
      },
    },
    define: {
      // 优先读构建时的环境变量，兜底读生成的文件
      // 使用 __BUILD_TIME__ 与其它子应用保持一致
      __BUILD_TIME__: isDev ? undefined : `"${dayjs().format('YYYYMMDDHHmm')}"`,
    },
    build: {
      outDir: '../../dist/main',
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'jse/index-[name]-[hash].js',
          manualChunks: appManualChunks,
        },
      },
      target: 'es2015',
    },
    server: {
      host: true,
      port: 9000,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
});
