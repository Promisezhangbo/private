/** 与 backend/README.md、api-server/README.md 同步（控制台展示用） */

export const API_SERVER_PROD_URL = 'https://api-server.promisezhangbo.deno.net';
export const API_SERVER_SPEC = 'api/api-server.yaml';

export const BACKEND_INTRO = [
  'Monorepo 后端位于 backend/，当前唯一服务为 api-server（Deno + Hono + PostgreSQL），契约由 api/api-server.yaml 描述，前端通过 @packages/openapi 生成的 OpenApiApiServer 调用。',
  '无 DATABASE_URL 时 api-server 使用内存占位数据，便于本地无库开发；连库时在 backend/api-server/.env.local 配置连接串。SQL 控制台迁移脚本在 sql/console/，运行时不会自动建表。',
  'pnpm dev 仅启动 apps/* 微前端，api-server 需单独执行 pnpm --filter api-server dev 或 dev:db。',
] as const;

export const BACKEND_DIR_TREE = `backend/
└── api-server/                 # Deno Deploy App directory
    ├── src/
    │   ├── main.ts             # 入口 export { fetch }
    │   ├── app.ts              # CORS、路由挂载
    │   ├── core/               # env、db、http、validate、pagination
    │   ├── blog/               # Blog 路由 + store
    │   ├── stock/              # Stock 路由 + store + price
    │   └── system/             # /health 等
    ├── sql/console/            # 在 Prisma / Deploy SQL 控制台手动执行的 DDL
    ├── tools/                  # 本地调试（如 inspect-stock-table.ts）
    ├── deno.json               # deno task dev / dev:db
    └── .env.example            # 复制为 .env.local → DATABASE_URL`;

export type BackendCommandRow = {
  where: string;
  command: string;
  desc: string;
};

export const BACKEND_COMMANDS: BackendCommandRow[] = [
  {
    where: '仓库根',
    command: 'pnpm --filter api-server dev',
    desc: '无 DATABASE_URL：内存数据',
  },
  {
    where: '仓库根',
    command: 'pnpm --filter api-server dev:db',
    desc: '读取 backend/api-server/.env.local',
  },
  {
    where: 'backend/api-server',
    command: 'deno task dev:db',
    desc: '同上，在包目录内执行',
  },
  {
    where: 'backend/api-server',
    command: 'deno run --allow-net --allow-env --env-file=.env.local tools/inspect-stock-table.ts',
    desc: '查看 stock 表结构与样例行',
  },
];

export const BACKEND_API_ROWS = [
  { module: 'Blog', routes: 'GET /getBlogList · GET /getBlog · POST /updateBlogName', table: 'blogs（BLOG_TABLE）' },
  {
    module: 'Stock',
    routes: 'GET /getStockList · GET /getStock · POST /createStock · POST /deleteStock',
    table: 'stock（STOCK_TABLE）',
  },
  { module: 'System', routes: 'GET / · GET /health', table: '—' },
] as const;

export const BACKEND_ENV_ROWS = [
  { name: 'DATABASE_URL', desc: 'PostgreSQL 连接串；Deploy 由平台注入' },
  { name: 'BLOG_TABLE', desc: '可选，默认 blogs' },
  { name: 'STOCK_TABLE', desc: '可选，默认 stock' },
  { name: 'CORS_ALLOWED_ORIGINS', desc: '额外允许的浏览器 Origin（完整 URL）' },
] as const;
