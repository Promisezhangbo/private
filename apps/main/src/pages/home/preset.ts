export const OVERVIEW = {
  title: 'Private 工作台',
  subtitle:
    '基于 pnpm workspace + Turbo 的 Monorepo：前端 apps/* 由 qiankun 挂载；后端 backend/api-server（Deno）实现 api/api-server.yaml；OpenAPI 生成 SDK 供子应用调用。',
};

export const SUB_APPS = [
  {
    key: 'main',
    name: 'main',
    path: '/home',
    devPort: '9000',
    role: '主应用',
    desc: '顶栏布局、主题（浅色/暗色）、路由壳层、子应用注册与全局加载态；控制台首页即本页。访问 `/home` 时用 `@packages/seo` 写入宿主页 SEO。',
  },
  {
    key: 'agent',
    name: 'agent',
    path: '/agent',
    devPort: '9001',
    role: '子应用',
    desc: '对话式 AI 工作台：流式/非流式 LLM 调用、Markdown 渲染(@ant-design/x-markdown),可通过环境变量配置模型 Key。',
  },
  {
    key: 'blog',
    name: 'blog',
    path: '/blog',
    devPort: '9002',
    role: '子应用',
    desc: '技术博客：文章列表与详情、本地 posts 数据驱动的阅读体验。',
  },
  {
    key: 'login',
    name: 'login',
    path: '/login',
    devPort: '9003',
    role: '子应用',
    desc: '登录与注册:独立构建与部署入口,qiankun 场景下开发期通过固定 publicPath 保证静态资源指向子应用 origin。',
  },
  {
    key: 'skill',
    name: 'skill',
    path: '/skill',
    devPort: '9004',
    role: '子应用',
    desc: '技能图谱展示：技术栈熟练度等可视化（含动效）。',
  },
  {
    key: 'resume',
    name: 'resume',
    path: '/resume',
    devPort: '9005',
    role: '子应用',
    desc: '在线简历：技能、工作经历、项目、教育与自我评价等结构化展示；样式与主题与主应用对齐。导出为下载静态文件 apps/resume/public/xx.pdf（构建后同源路径 /resume/xx.pdf）。',
  },
  {
    key: 'utils',
    name: 'utils',
    path: '/utils',
    devPort: '9006',
    role: '子应用',
    desc: '工具箱：股票持仓成本、OpenAPI SDK 使用说明（基于 api-server.yaml 的静态演示）等页面。',
  },
] as const;

export type PackageLink = {
  label: string;
  href: string;
  /** 站内路径用 React Router；外链新窗口打开 */
  external?: boolean;
};

export type PackageItem = {
  name: string;
  desc: string;
  links?: readonly PackageLink[];
};

export const PACKAGES: readonly PackageItem[] = [
  {
    name: '@packages/style-config',
    desc: '跨应用 Sass 变量、主题 mixin、语义色板(CSS 变量，对齐 Ant Design 深浅色)。',
  },
  { name: '@packages/ts-config', desc: 'TypeScript 工程引用与全局类型声明。' },
  { name: '@packages/vite-build-utils', desc: 'Vite/Rollup manualChunks 等构建复用逻辑。' },
  { name: '@packages/stylelint-config', desc: 'Stylelint 共享配置。' },
  {
    name: '@packages/openapi',
    desc:
      'Monorepo 内 OpenAPI 工作流：api/*.yaml + packages/openapi/openapi.config.ts → 自研 openapi-axios-sdk（openapi-gen）→ packages/openapi/gen/；包内 pnpm run generate / typecheck，仓库根 pnpm run generate。与 backend/api-server 配套。',
    links: [
      { label: 'SDK 使用说明（utils 子应用）', href: '/utils/openapi' },
      {
        label: 'openapi-axios-sdk（自研，npm）',
        href: 'https://www.npmjs.com/package/openapi-axios-sdk',
        external: true,
      },
    ],
  },
  {
    name: '@packages/seo',
    desc: '运行时 SEO：`applyDocumentSeo` 同步宿主 `document` 的 title、description、Open Graph、Twitter Card 与 canonical；`appSeoPresets` 提供主应用与各子应用默认文案。主应用在 `/home`、子应用在 `render` 入口调用；详见 `docs/seo.md`。',
  },
] as const;

export const TECH_STACK = {
  runtime: ['React 19', 'React Router 7', 'Ant Design 6', '@ant-design/icons', 'qiankun 2.x', 'vite-plugin-qiankun', 'Sass'],
  build: ['Vite 8', 'TypeScript 5.9', 'Rolldown', 'openapi-axios-sdk（自研 openapi-gen）'],
  workspace: ['pnpm 10 workspace', 'Turbo 2.x', 'apps/* + packages/* + backend/* + api/*.yaml'],
  backend: ['Deno', 'Hono', 'PostgreSQL（Prisma Postgres）', 'Deno Deploy'],
  quality: ['oxlint', 'stylelint', 'oxfmt', 'husky', 'lint-staged', 'commitlint'],
} as const;

export const ARCHITECTURE = {
  routing:
    '主应用使用 React Router 7：`/` 重定向至 `/home` 展示控制台；`/agent`、`/blog`、`/resume`、`/login` 等前缀与 qiankun 的 `activeRule` 对齐。子应用挂载点为布局内的 `#sub-app`；其中 `resume` 子应用内将 `/resume` 重定向至 `/resume/home` 展示简历页。未匹配子应用的路由由主应用壳层承载。',
  buildDeploy:
    '每个子应用独立 `vite build`，产物输出到仓库根目录 `dist/<app>/`，生产环境 `base` 为同源子路径（如 `/agent/`）。开发环境 entry 指向 `//localhost:900x`；子应用内联资源需使用与子应用 dev Server 一致的 publicPath / origin,避免在主应用域名下 404。',
  globalState:
    '通过 qiankun `initGlobalState` 维护全局状态（如子应用加载中 `loading`、当前应用名 `loadingAppName`），在 `beforeMount` / `afterMount` 钩子中更新，供主应用顶栏或壳层展示加载反馈。',
  runtimeIsolation:
    '使用 `registerMicroApps` + `start` 拉起子应用生命周期；`prefetch` 关闭以降低首访噪音；`sandbox` 开启，当前未启用实验性样式隔离（`experimentalStyleIsolation: false`），依赖命名空间与约定减少样式串扰。',
  styling:
    '跨应用复用 `@packages/style-config`(Sass 变量与 mixin),语义色板以 CSS 变量挂在 `:root` / `html[data-theme]`，与主应用 `ThemeRoot` + Ant Design `algorithm` 同步切换浅/暗色，保证顶栏与子应用壳层观感一致。',
  backend:
    '后端 `backend/api-server` 独立进程部署（默认 https://api-server.promisezhangbo.deno.net）。子应用通过 `VITE_API_SERVER_BASE` 指向该地址；契约见 `api/api-server.yaml`，与 `@packages/openapi` 生成类型一致。`pnpm dev` 不启动后端，需另开终端 `pnpm --filter api-server dev:db`。',
} as const;
