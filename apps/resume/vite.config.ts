import { appManualChunks } from '@packages/vite-build-utils';
import { deployTagDefine, loadDeployEnv } from '@packages/vite-build-utils/loadDeployEnv';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import qiankun from 'vite-plugin-qiankun';

const monorepoRoot = path.resolve(__dirname, '../..');
loadDeployEnv(monorepoRoot);

// https://vite.dev/config/
export default defineConfig((config) => {
  const { mode } = config;
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = env.NODE_ENV === 'development';
  return {
    define: deployTagDefine(),
    plugins: [
      ...(isDev ? [] : [react()]),
      qiankun('resume', {
        useDevMode: true,
      }),
    ],
    build: {
      outDir: '../../dist/resume',
      chunkSizeWarningLimit: 1600,
      rolldownOptions: {
        output: {
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'jse/index-[name]-[hash].js',
          manualChunks: appManualChunks,
        },
      },
      target: 'es2015',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@style-config': path.resolve(__dirname, '../../packages/style-config/scss'),
      },
    },
    /* 与生产一致；开发时经 main:9000 代理访问 /resume/ */
    base: '/resume/',
    server: {
      port: 9005,
      host: true,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
});
