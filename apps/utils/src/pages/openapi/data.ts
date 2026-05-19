/** 与仓库根目录 `api/api-server.yaml` 同步的静态演示数据（仅展示，不发起请求）。 */

export const SPEC_FILE = 'api/api-server.yaml';

/** openapi-gen 配置文件（相对 Monorepo 根目录） */
export const OPENAPI_CONFIG_PATH = 'packages/openapi/openapi.config.ts';

/** @packages/openapi 的 package.json（相对 Monorepo 根目录） */
export const OPENAPI_PACKAGE_JSON_PATH = 'packages/openapi/package.json';

export const OPENAPI_CONFIG_SNIPPET = `// ${OPENAPI_CONFIG_PATH}
import { defineConfig } from 'openapi-axios-sdk/config';

/** 在 packages/openapi 目录执行 generate 时，cwd 为本目录；apiDir / outDir 相对此处解析 */
export default defineConfig({
  apiDir: '../../api',   // → 仓库根 api/*.yaml
  outDir: 'gen',         // → packages/openapi/gen/
  gitignore: false,
  verbose: false,
});`;

export type PackageScriptRow = {
  where: string;
  command: string;
  desc: string;
};

/** @packages/openapi 与仓库根目录常用命令 */
export const OPENAPI_PACKAGE_SCRIPTS: PackageScriptRow[] = [
  {
    where: '仓库根',
    command: 'pnpm run generate',
    desc: 'Turbo 调度 @packages/openapi#generate；改 api/*.yaml 或 openapi.config.ts 后手动执行',
  },
  {
    where: '仓库根',
    command: 'pnpm exec turbo run generate --filter=@packages/openapi',
    desc: '仅生成 OpenAPI SDK，不跑其它包',
  },
  {
    where: 'packages/openapi',
    command: 'pnpm run generate',
    desc: '等价于 openapi-gen -c ./openapi.config.ts（须在 packages/openapi 目录下）',
  },
  {
    where: 'packages/openapi',
    command: 'pnpm run typecheck',
    desc: '对 gen/ 与包内 TS 做 tsc --noEmit（需已 generate）',
  },
  {
    where: '任意子应用',
    command: 'pnpm exec turbo run dev --filter=utils...',
    desc: 'dev/build 依赖 ^generate，启动前会自动先跑本包 generate（见 turbo.json）',
  },
];

export const MONOREPO_INTRO = [
  '本仓库是一个 pnpm workspace + Turborepo 的 Monorepo：多个前端子应用（apps/*）与共享包（packages/*）在同一仓库内协作开发。',
  '接口契约统一放在根目录 api/*.yaml；由共享包 @packages/openapi 调用 openapi-axios-sdk 的 openapi-gen 生成 Axios SDK，各子应用通过 workspace 依赖引用，避免每个 app 各自维护一份生成逻辑。',
  '后端 api-server（Deno + Hono）实现 api/api-server.yaml 中的路由；本演示页对应该文档与 OpenApiApiServer 工厂，不涉及文件上传或服务端 codegen。',
] as const;

/** 仅展示 OpenAPI 链路相关目录，非完整仓库树。 */
export const REPO_DIR_TREE = `private/                          # Monorepo 根（pnpm workspace）
├── api/                          # ★ OpenAPI / Swagger 文档（输入）
│   ├── api-server.yaml           #     本页演示的后端 API（Blog + Stock）
│   ├── blog.yaml                 #     其它业务 API 文档
│   └── login.yaml
├── packages/
│   └── openapi/                  # ★ @packages/openapi
│       ├── openapi.config.ts     #     ★ 生成配置（packages/openapi/openapi.config.ts）
│       ├── package.json          #     ★ scripts: generate / typecheck
│       └── gen/                  #     ★ 生成产物（gitignore，pnpm generate 后才有）
│           ├── index.ts          #         聚合 OpenApiBlog、OpenApiApiServer …
│           ├── api-server-gen/   #         单 spec：sdk.gen.ts、types.ts
│           ├── blog-gen/
│           └── login-gen/
├── apps/                         # 微前端子应用（Vite + qiankun）
│   ├── main/                     #     基座，注册子应用
│   ├── utils/                    #     本工具箱；stockServer 使用 OpenApiApiServer
│   ├── blog/                     #     blogServer → OpenApiApiServer
│   └── resume/                   #     示例：OpenApiBlog
├── backend/
│   └── api-server/               #     Deno 实现 api-server.yaml 中的 HTTP 路由
├── turbo.json                    #     dev/build 依赖 ^generate
├── pnpm-workspace.yaml
└── package.json                  #     根脚本：pnpm run generate`;

export const OPENAPI_PATH_ROWS = [
  { path: 'api/*.yaml', desc: 'OpenAPI 3 文档源；文件名（去后缀）决定工厂名，如 api-server.yaml → OpenApiApiServer' },
  {
    path: OPENAPI_CONFIG_PATH,
    desc: 'openapi-gen 唯一配置文件；defineConfig 指定 apiDir=../../api、outDir=gen（路径相对 packages/openapi）',
  },
  {
    path: OPENAPI_PACKAGE_JSON_PATH,
    desc: '包脚本：generate → openapi-gen -c ./openapi.config.ts；typecheck → tsc',
  },
  { path: 'packages/openapi/gen/', desc: '生成代码目录；修改 yaml 后执行 pnpm run generate 更新' },
  { path: 'packages/openapi/gen/index.ts', desc: '统一导出各 spec 的 OpenApi<Name> 工厂' },
  { path: 'packages/openapi/gen/*-gen-types', desc: '仅类型的子路径导出，如 @packages/openapi/api-server-gen-types' },
  { path: 'turbo.json', desc: 'globalDependencies 含 api/**/*.yaml；dev/build 前自动跑 ^generate' },
  { path: 'backend/api-server/', desc: '实现 api-server.yaml 的后端服务（与 SDK 的 BASE 对应）' },
] as const;

export const OPENAPI_CONSUMERS = [
  { path: 'apps/utils/src/api/stockServer.ts', desc: 'OpenApiApiServer + api-server-gen-types（持仓成本工具）' },
  { path: 'apps/blog/src/api/blogServer.ts', desc: 'OpenApiApiServer，调用 Blog 相关接口' },
  { path: 'apps/resume/src/utils/request.ts', desc: 'OpenApiBlog，示例另一份 spec' },
] as const;
export const FACTORY_NAME = 'OpenApiApiServer';
export const PROD_BASE = 'https://api-server.promisezhangbo.deno.net';

export const WORKFLOW_STEPS = [
  {
    title: '编写 OpenAPI 文档',
    desc: `在仓库 \`${SPEC_FILE}\` 中维护路径、operationId、请求/响应 schema。`,
  },
  {
    title: '配置生成',
    desc: `编辑 \`${OPENAPI_CONFIG_PATH}\`（\`defineConfig\`，\`apiDir\` → 仓库 \`api/\`，\`outDir\` → \`gen/\`）。`,
  },
  {
    title: '执行生成',
    desc: '仓库根 `pnpm run generate`，或在 `packages/openapi` 下 `pnpm run generate`（见本页「命令说明」）。',
  },
  {
    title: '业务中初始化 SDK',
    desc: `从 \`@packages/openapi\` 导入 \`${FACTORY_NAME}\`，传入 BASE、鉴权等。`,
  },
  {
    title: '调用生成的方法',
    desc: '方法名与 YAML 中 `operationId` 一致，如 `getStockList`、`createStock`。',
  },
] as const;

export const INIT_SNIPPET = `import { OpenApiApiServer } from '@packages/openapi';

/** 与 apps/utils/src/api/stockServer.ts 相同写法 */
export const apiServer = OpenApiApiServer({
  BASE:
    import.meta.env.VITE_API_SERVER_BASE?.trim() ||
    '${PROD_BASE}',
  WITH_CREDENTIALS: true,
  errorHandling: { reporter: () => {}, debounceMs: 200 },
});`;

export const WRAPPER_SNIPPET = `import type { CreateStockRequest, StockListPage } from '@packages/openapi/api-server-gen-types';
import { apiServer } from './apiServer';

export async function getStockList(params?: {
  page?: number;
  pageSize?: number;
  stock_code?: string;
}): Promise<StockListPage> {
  const { data } = await apiServer.getStockList({ query: params });
  return data ?? { items: [], total: 0, page: 1, pageSize: 10 };
}

export async function createStock(body: CreateStockRequest) {
  const { data } = await apiServer.createStock({ body });
  if (!data) throw new Error('createStock: empty response');
  return data;
}`;

export type ApiOperationDemo = {
  tag: 'Blog' | 'Stock';
  operationId: string;
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  callSnippet: string;
};

export const API_OPERATIONS: ApiOperationDemo[] = [
  {
    tag: 'Blog',
    operationId: 'getBlogList',
    method: 'GET',
    path: '/getBlogList',
    summary: '获取博客列表（分页，可按 name 筛选）',
    callSnippet: `const { data } = await apiServer.getBlogList({
  query: { page: 1, pageSize: 10, name: '关键词' },
});
// data: BlogListPage`,
  },
  {
    tag: 'Blog',
    operationId: 'getBlog',
    method: 'GET',
    path: '/getBlog',
    summary: '按 id 获取单条博客',
    callSnippet: `const { data } = await apiServer.getBlog({
  query: { id: 1 },
});
// data: BlogListItem`,
  },
  {
    tag: 'Blog',
    operationId: 'updateBlogName',
    method: 'POST',
    path: '/updateBlogName',
    summary: '更新博客名称',
    callSnippet: `const { data } = await apiServer.updateBlogName({
  body: { id: 1, name: '新名称' },
});
// data: BlogListItem`,
  },
  {
    tag: 'Stock',
    operationId: 'getStockList',
    method: 'GET',
    path: '/getStockList',
    summary: '持仓成本记录分页列表（可按 stock_code 筛选）',
    callSnippet: `const { data } = await apiServer.getStockList({
  query: { page: 1, pageSize: 10, stock_code: '159231' },
});
// data: StockListPage`,
  },
  {
    tag: 'Stock',
    operationId: 'getStock',
    method: 'GET',
    path: '/getStock',
    summary: '按 id 获取单条持仓记录',
    callSnippet: `const { data } = await apiServer.getStock({
  query: { id: 1 },
});
// data: StockRecord`,
  },
  {
    tag: 'Stock',
    operationId: 'createStock',
    method: 'POST',
    path: '/createStock',
    summary: '新增持仓成本记录（end_cost 由服务端计算）',
    callSnippet: `const { data } = await apiServer.createStock({
  body: {
    stock_code: '159231',
    stock_name: '通用航空ETF华宝',
    init_cost: 1.042,
    init_num: 1100,
    add_cost: 1.007,
    add_num: 1000,
    commission: 5,
  },
});
// data: StockRecord`,
  },
  {
    tag: 'Stock',
    operationId: 'deleteStock',
    method: 'POST',
    path: '/deleteStock',
    summary: '删除持仓成本记录',
    callSnippet: `const { data } = await apiServer.deleteStock({
  body: { id: 1 },
});
// data: { ok: true, id: number }`,
  },
];
