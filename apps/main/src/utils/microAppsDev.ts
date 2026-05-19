/** AUTO-GENERATED — 请勿手改。运行 pnpm micro-app:sync 或 create/remove 后自动更新。 */
/**
 * 微应用开发期端口、路由前缀与生产 entry 路径。
 * 数据源：packages/micro-app-cli/micro-apps.registry.json
 * - `qiankun.ts` 据此生成 `apps`
 * - `vite.config.ts` 据此生成 `server.proxy`
 */
export const microAppsDev = [
  { name: 'agent', port: 9001, prodBase: '/agent/', activeRule: '/agent' },
  { name: 'blog', port: 9002, prodBase: '/blog/', activeRule: '/blog' },
  { name: 'login', port: 9003, prodBase: '/login/', activeRule: '/login' },
  { name: 'skill', port: 9004, prodBase: '/skill/', activeRule: '/skill' },
  { name: 'resume', port: 9005, prodBase: '/resume/', activeRule: '/resume' },
  { name: 'utils', port: 9006, prodBase: '/utils/', activeRule: '/utils' },
] as const;
