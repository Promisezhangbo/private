import { appManualChunks } from '@packages/vite-build-utils';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import qiankun from 'vite-plugin-qiankun';
import dayjs from 'dayjs';
// https://vite.dev/config/
export default defineConfig((config) => {
  const { mode } = config;
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = env.NODE_ENV === 'development';
  return {
    plugins: [
      ...(isDev ? [] : [react()]),
      qiankun('blog', {
        useDevMode: true,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@style-config': path.resolve(__dirname, '../../packages/style-config/scss'),
      },
    },
    define: {
      // 优先读构建时的环境变量，兜底读生成的文件
      __BUILD_TIME__: isDev ? undefined : `"${dayjs().format('YYYY-MM-DD HH:mm:ss')}"`,
    },
    build: {
      outDir: '../../dist/blog',
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
    base: isDev ? '/' : '/blog/',
    server: {
      port: 9002,
      cors: true,
      host: true,
      headers: {
        'access-control-allow-origin': '*',
      },
    },
  };
});
