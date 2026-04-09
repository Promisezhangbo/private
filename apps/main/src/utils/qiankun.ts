import { qiankunState } from '@/utils/qiankunGlobalState';
import { microAppsDev } from '@/utils/microAppsDev';
import { registerMicroApps, start } from 'qiankun';

const isDev = process.env.NODE_ENV === 'development';

export { microAppsDev };

/**
 * 开发环境微应用 entry：
 * - 必须用 **http://** 显式协议。`//localhost:9002` 在 HTTPS 页（如 github.io / Whistle 反代）下会变成 https://localhost:9002，
 *   本地 Vite 只有 HTTP → `ERR_SSL_PROTOCOL_ERROR`。
 * - 通过 Whistle 把浏览器地址留在 `https://*.github.io` 时，用「同源 + 路径」拉子应用 HTML，避免混合内容与错误协议。
 * - Whistle 只需一条（类似 Netlify 整站指向）：`promisezhangbo.github.io/ http://127.0.0.1:9000/`
 *   主应用 Vite 的 `server.proxy` 与下方注册列表同源（`src/utils/microAppsDev.ts`），会把各 `activeRule` 转发到对应端口并保留路径前缀。
 * - 本地直连子应用调试时仍可用 `http://127.0.0.1:子端口/xxx/`（见下方非 github.io 分支）。
 *
 * 各子应用 dev 与 prod 的 `base` 均为 `/xxx/`（见各子应用 vite.config）；经主应用代理访问时路径为 `/xxx/...`，与 base 一致。
 */
function devMicroEntry(port: number, prodBase: string, localPath = '/'): string {
  if (!isDev) return prodBase;
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io')) {
    const base = prodBase.startsWith('/') ? prodBase : `/${prodBase}`;
    return `${window.location.origin}${base}`;
  }
  const p = localPath.startsWith('/') ? localPath : `/${localPath}`;
  return `http://127.0.0.1:${port}${p}`;
}

export const apps = microAppsDev.map((m) => ({
  name: m.name,
  entry: devMicroEntry(m.port, m.prodBase, m.prodBase),
  container: '#sub-app',
  activeRule: m.activeRule,
  props: {},
}));

export function registerAppsFn() {
  registerMicroApps(apps, {
    beforeLoad: async () => {},
    beforeMount: async (app) => {
      qiankunState.globalState.setGlobalState({ loading: true, loadingAppName: app.name });
    },
    afterMount: async (app) => {
      setTimeout(() => {
        qiankunState.globalState.setGlobalState({ loading: false, loadingAppName: app.name });
      }, 1000);
    },
    beforeUnmount: async () => {},
    afterUnmount: async () => {},
  });

  start({
    sandbox: {
      experimentalStyleIsolation: false,
    },
    prefetch: false,
  });
}
