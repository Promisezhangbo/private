# @packages/openapi

从仓库根目录 **`api/*.yaml`** 生成 Axios SDK，由 **`openapi-axios-sdk`** 提供的 CLI **`openapi-gen`** 执行（配置见本目录 **`openapi.config.ts`**）。产物在 **`gen/`**（已 **gitignore**，检出后须生成）。**`turbo run build` / `turbo run dev`** 会通过 **`dependsOn: ^generate`** 先对本包执行 **`generate`**。改 spec 后可手动：

`pnpm run generate`（仓库根，等价于 `turbo run generate --filter=@packages/openapi`）

**注意**：若对子应用使用 **`pnpm --filter <app> build`** 而**不用** Turbo，则**不会**触发生成，会出现找不到 **`gen/index.ts`**、**`*-gen-types`** 等错误；应使用 **`pnpm exec turbo run build --filter=<app>`**（与 GitHub 单应用部署一致）。

## 包内入口

| 入口 | 作用 |
| --- | --- |
| `@packages/openapi` | 聚合导出各 spec 的 **`OpenApi<Name>`** 工厂（来自 **`gen/index.ts`**，由 `openapi-gen` 生成） |
| `@packages/openapi/<name>-gen` | 单 spec 子包（可选；推荐从根入口导入） |
| `@packages/openapi/<name>-gen-types` | 仅类型 |

运行时公共逻辑在依赖 **`openapi-axios-sdk/runtime`**（由生成代码引用）；高级用法见 [openapi-axios-sdk README](https://www.npmjs.com/package/openapi-axios-sdk)。

## 示例：初始化并调用

```ts
import { OpenApiBlog } from '@packages/openapi';

export const blogApi = OpenApiBlog({
  BASE: 'https://blog-api.example.com',
  token: () => localStorage.getItem('t') ?? '',
  WITH_CREDENTIALS: true,
});

const { data } = await blogApi.listKnowledgeBases({ body: { request_id: crypto.randomUUID() } });
```

## 类型优先（无 axios）

若主要只要类型、自己在业务里封装 `axios`，可从子路径只引生成类型：

```ts
import type {
  KnowledgeBaseListItem,
  ListKnowledgeBasesRequest,
  ListKnowledgeBasesResponse,
} from '@packages/openapi/blog-gen-types';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export async function listKnowledgeBases(body: ListKnowledgeBasesRequest) {
  const { data } = await axios.post<ListKnowledgeBasesResponse>(`${baseURL}/yuniverse/kb/list`, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}
```

路径、方法名以各 `api/*.yaml` 为准。需要带鉴权/统一错误的现成客户端时用根入口的 **`OpenApi<Name>()`** + 生成 SDK。

### 具名类型（可复用）

`@hey-api/openapi-ts` 对 **`components/schemas` 里具名且被 `$ref` 引用的模型** 会生成独立 `export type`。内联对象只会变成匿名类型；要在业务里复用列表项等类型，请在 YAML 中提成 `components/schemas` 并 `$ref`。
