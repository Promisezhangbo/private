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
  /** 与主应用 qiankun entry（localhost:9003）一致；否则 dev 下资源为 `/xxx`，会落到主应用域名导致 404 */
  const devPublicBase = 'http://localhost:9003/';
  return {
    define: deployTagDefine(),
    /* 开发环境也必须启用 @vitejs/plugin-react，否则与预构建/TS 不一致；此前 isDev 下关闭会导致依赖预打包异常偏大 */
    plugins: [
      ...(isDev ? [] : [react()]),
      qiankun('login', {
        useDevMode: true,
      }),
    ],
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'antd'],
    },
    build: {
      outDir: '../../dist/login',
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
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@style-config': path.resolve(__dirname, '../../packages/style-config/scss'),
      },
    },
    base: isDev ? devPublicBase : '/login/',
    server: {
      port: 9003,
      /** 与 base 一致，保证生成的资源 URL 在微前端场景下带正确 origin（见 Vite 静态资源 / server.origin） */
      origin: 'http://localhost:9003',
      host: true,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  };
});
