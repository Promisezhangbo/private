import { appManualChunks } from '@packages/vite-build-utils';
import { deployTagDefine, loadDeployEnv } from '@packages/vite-build-utils/loadDeployEnv';
import react from '@vitejs/plugin-react';
import type { IncomingMessage } from 'node:http';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { microAppsDev } from './src/utils/microAppsDev';

const monorepoRoot = path.resolve(__dirname, '../..');
loadDeployEnv(monorepoRoot);

/**
 * 浏览器在 /agent、/resume 等子路径上「整页刷新」时，若不做处理，Vite 会把该 HTML 请求代理到子应用端口，
 * 拿到的是子应用 index.html → 主应用壳（Layout、qiankun）永远不会挂载。
 * qiankun 拉子应用 entry 一般为 fetch（Sec-Fetch-Dest: empty）或直连子端口，不应走此分支。
 */
function bypassMicroProxyToMainSpa(req: IncomingMessage): string | undefined {
  if (req.method !== 'GET') return undefined;
  if (req.headers.upgrade === 'websocket') return undefined;
  const accept = String(req.headers.accept || '');
  if (!accept.includes('text/html')) return undefined;
  const dest = String(req.headers['sec-fetch-dest'] || '');
  const mode = String(req.headers['sec-fetch-mode'] || '');
  if (dest === 'document' || mode === 'navigate') {
    return '/index.html';
  }
  return undefined;
}

/** 开发环境：Whistle 整站指 9000；proxy 表与 `qiankun.ts` 共用 `microAppsDev` */

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
      ...(isDev && {
        proxy: Object.fromEntries(
          microAppsDev.map((m) => [
            m.activeRule,
            {
              target: `http://127.0.0.1:${m.port}`,
              changeOrigin: true,
              ws: true,
              bypass: (req: IncomingMessage) => bypassMicroProxyToMainSpa(req),
            },
          ]),
        ),
      }),
    },
  };
});
