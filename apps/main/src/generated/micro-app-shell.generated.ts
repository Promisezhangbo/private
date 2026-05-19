/** AUTO-GENERATED — 请勿手改。运行 pnpm micro-app:sync 或 create/remove 后自动更新。 */

export const microAppMenuEntries = [
  { key: 'skill', label: '技能', sub: true },
  { key: 'resume', label: '简历', sub: true },
  { key: 'agent', label: 'AI工作台', sub: true },
  { key: 'blog', label: '博客', sub: true },
  { key: 'utils', label: '工具', sub: true },
  { key: 'login', label: '登录', sub: true },
] as const;

export const microAppMenuPaths: Record<string, string> = {
  skill: '/skill/home',
  resume: '/resume/home',
  agent: '/agent/home',
  blog: '/blog',
  utils: '/utils/list',
  login: '/login',
};

export const microAppBlogSurfaceKeys = ['skill', 'resume', 'blog', 'utils'] as const;
