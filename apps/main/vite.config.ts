import { appManualChunks } from '@packages/vite-build-utils';
import { deployTagDefine, loadDeployEnv } from '@packages/vite-build-utils/loadDeployEnv';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

const monorepoRoot = path.resolve(__dirname, '../..');
loadDeployEnv(monorepoRoot);

// https://vite.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig((config) => {
  const { mode } = config;
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = env.NODE_ENV === 'development';

  return {
    base: isDev ? '/' : '/main/',
    define: deployTagDefine(),
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@style-config': path.resolve(__dirname, '../../packages/style-config/scss'),
      },
    },
    build: {
      outDir: '../../dist/main',
      chunkSizeWarningLimit: 900,
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
