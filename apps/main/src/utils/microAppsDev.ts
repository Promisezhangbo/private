/**
 * 微应用开发期端口、路由前缀与生产 entry 路径（唯一数据源）。
 * - `qiankun.ts` 据此生成 `apps`
 * - `vite.config.ts` 据此生成 `server.proxy`
 *
 * 新增子应用时只改本文件。
 */
export const microAppsDev = [
  { name: 'agent', port: 9001, prodBase: '/agent/', activeRule: '/agent' },
  { name: 'blog', port: 9002, prodBase: '/blog/', activeRule: '/blog' },
  { name: 'login', port: 9003, prodBase: '/login/', activeRule: '/login' },
  { name: 'skill', port: 9004, prodBase: '/skill/', activeRule: '/skill' },
  { name: 'resume', port: 9005, prodBase: '/resume/', activeRule: '/resume' },
] as const;
