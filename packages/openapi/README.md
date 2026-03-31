# @packages/openapi

从仓库根目录 `api/*.yaml` 生成 Axios SDK。仓库根 `prebuild` / `predev` 会跑生成；改 spec 后也可手动执行：

`pnpm --filter @packages/openapi run generate`

## 包内入口

| 入口 | 作用 |
|------|------|
| `@packages/openapi` | 聚合导出所有 `OpenApi<Name>Fn`（来自 `src/clients.ts`，自动生成），用于 VSCode 自动导入 |
| `@packages/openapi/request` | 公共初始化器（生成的 `*-gen/index.ts` 内部复用，业务一般不需要直接用） |
| `@packages/openapi/<name>-gen` |（可选）不再对外导出，避免 `package.json` 过长；推荐统一从根入口导入 |

生成时把 `scripts/openapi-http.gen.ts` 拷入每个 `*-gen/` 的 `openapi-http.gen.ts`，并删除 Hey API 自动生成的无用 `index.ts`。

## 示例：初始化并调用

```ts
import { OpenApiBlogFn } from '@packages/openapi';

export const blogApi = OpenApiBlogFn({
  BASE: 'https://blog-api.example.com',
  token: () => localStorage.getItem('t') ?? '',
  WITH_CREDENTIALS: true,
});

const { data } = await blogApi.listKnowledgeBases({ body: { request_id: crypto.randomUUID() } });
```

## 类型优先（无 axios）

若你**主要想要类型**，希望在应用里**自己封装 axios**（拦截器、baseURL、错误处理全在业务侧），可从子路径**只引生成类型**，不经过 `OpenApiFn` / `openApiHttpClient`：

```ts
import type {
  KnowledgeBaseListItem,
  ListKnowledgeBasesRequest,
  ListKnowledgeBasesResponse,
} from '@packages/openapi/blog-gen-types';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export async function listKnowledgeBases(body: ListKnowledgeBasesRequest) {
  const { data } = await axios.post<ListKnowledgeBasesResponse>(
    `${baseURL}/yuniverse/kb/list`,
    body,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return data;
}

// 列表项：具名 schema 在 spec 里已 $ref，可直接用 KnowledgeBaseListItem[]
```

路径、方法名仍以 `api/openapi.yaml` 为准；上例 URL 需与文档一致。需要 **带鉴权/统一错误的现成客户端** 时再用根入口的 `OpenApiFn()` + 生成 SDK。

### 具名类型（可复用）

`@hey-api/openapi-ts` 对 **`components/schemas` 里具名且被 `$ref` 引用的模型** 会生成独立 `export type`（如 `KnowledgeBaseListItem`）。**写在响应里的内联 `items: { type: object, properties: ... }` 只会变成匿名内联对象**，无法 `import` 单用。

要在业务里直接用「列表项」类型：在 `api/openapi.yaml` 中把该结构提成 `components/schemas/YourName`，在 `results.items`（或其它字段）上写 `$ref: '#/components/schemas/YourName'`；多处**完全相同**的结构应共用同一 `$ref`，生成类型即自动合并。

当前 spec 里已用 `$ref` 抽出的条目类型包括：`KnowledgeBaseListItem`、`FileListItem`、`GetFileTaskFileItem`、`FileTaskListItem`、`CreateChunkRequestItem`、`ChunkListItem`、`ChunkListItemMetadata`、`UpdateChunkRequestItem`。其余仍是内联对象的响应/请求，可按同样方式逐步补 schema。
