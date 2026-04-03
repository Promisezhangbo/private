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
      qiankun('skill', {
        useDevMode: true,
      }),
    ],
    build: {
      outDir: '../../dist/skill',
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
    base: isDev ? '/' : '/skill/',
    server: {
      port: 9004,
      host: true,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
});
