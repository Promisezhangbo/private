# @packages/openapi

从仓库根目录 `api/openapi.yaml` 生成 **一份** Axios SDK。仓库根 `prebuild` / `predev` 会跑生成；改 spec 后也可手动执行：

`pnpm --filter @packages/openapi run generate`

## 包内入口

| 文件 | 作用 |
|------|------|
| `src/openapi.types.ts` | 全部生成类型（再导出 `types.gen`） |
| `src/openapi.request.ts` | Axios 单例、拦截器、`OpenApiFn`、生成 SDK 与 `client` |
| `src/index.ts` | 统一导出上两者 |

生成时把 `scripts/openapi-http.gen.ts` 拷入 `src/generated/openapi-http.gen.ts`，供 `client.gen` 与 `openapi.request.ts` 共用 axios 实例（避免循环依赖）。生成结束会删掉 Hey API 产出的无用 `generated/index.ts`。

## 类型优先：`@packages/openapi/types`（无 axios）

若你**主要想要类型**，希望在应用里**自己封装 axios**（拦截器、baseURL、错误处理全在业务侧），可从子路径**只引生成类型**，不经过 `OpenApiFn` / `openApiHttpClient`：

```ts
import type {
  KnowledgeBaseListItem,
  ListKnowledgeBasesRequest,
  ListKnowledgeBasesResponse,
} from '@packages/openapi/types';
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

### 多个 YAML 时选哪一个？

| 情况 | 行为 |
|------|------|
| 存在 `api/openapi.yaml` | **始终用它**（与其它 `.yaml` 并存也没关系） |
| 没有 `openapi.yaml`、但有多个 `.yaml` | 取 **按路径名字排序后的第一个**，并在控制台打出警告，建议把主 spec 命名为 `openapi.yaml` |

其它文件可作为 **被 `$ref` 引入的碎片**（由主 yaml bundle 拉进来），不必单独参与上述选择。

若你需要 **两套互不合并的 OpenAPI → 两套客户端**，当前包只维护一个 `src/generated`，需要自行拆包、或复制本包并改 `scripts/generate.mjs` 的入口与输出目录，或把两份 API 合并进同一份 spec（路径/`operationId` 不冲突即可）。

### 具名类型（可复用）

`@hey-api/openapi-ts` 对 **`components/schemas` 里具名且被 `$ref` 引用的模型** 会生成独立 `export type`（如 `KnowledgeBaseListItem`）。**写在响应里的内联 `items: { type: object, properties: ... }` 只会变成匿名内联对象**，无法 `import` 单用。

要在业务里直接用「列表项」类型：在 `api/openapi.yaml` 中把该结构提成 `components/schemas/YourName`，在 `results.items`（或其它字段）上写 `$ref: '#/components/schemas/YourName'`；多处**完全相同**的结构应共用同一 `$ref`，生成类型即自动合并。

当前 spec 里已用 `$ref` 抽出的条目类型包括（生成后均可 `import type { … } from '@packages/openapi'`）：`KnowledgeBaseListItem`、`FileListItem`、`GetFileTaskFileItem`、`FileTaskListItem`、`CreateChunkRequestItem`、`ChunkListItem`、`ChunkListItemMetadata`、`UpdateChunkRequestItem`。其余仍是内联对象的响应/请求，可按同样方式逐步补 schema。

## 请求域名 / API 根（可跨域）

**不会**固定为浏览器当前页面域名。生成代码里 `client` 的默认 `baseURL` 来自 OpenAPI **`servers.url`**（如 `http://api.yuniverse.com`）；**实际环境请在应用入口用环境变量覆盖**，与页面是否同域无关。

```ts
import { OpenApiFn, configureOpenApiBase } from '@packages/openapi';

// 推荐：Vite 等从 env 读完整根地址（协议 + 域名 + 端口，可选路径）
const API_BASE = import.meta.env.VITE_API_BASE_URL; // 例 http://103.237.29.234:31011

OpenApiFn({
  BASE: API_BASE,
  token: () => localStorage.getItem('t') ?? '',
});

// 或只改地址、不配 token：
configureOpenApiBase(API_BASE);
```

- **`BASE`**：`http(s)://host:port` 或带路径的根，如 `http://103.237.29.234:31011`、`https://api.example.com/v1`。
- **`pathPrefix`**（可选）：在 `BASE` 后再接一段，例如 `BASE: 'http://host:31011'` + `pathPrefix: '/gateway'` → `http://host:31011/gateway`。**仅传 `pathPrefix` 时**是相对**当前页面 origin** 的路径，一般只适合本地同源代理；**跨域 API 请只设完整 `BASE`**。

`resolveOpenApiBase({ BASE, pathPrefix })` 可在业务里预先算出最终字符串再传给 `configureOpenApiBase`。

入参见各 `*Data` 类型；不传 `init` 时 `OpenApiFn()` 仍返回同一套方法（沿用当前 `client` / `openApiSettings`）。

### `responseType`（默认与单次覆盖）

- **全局默认**：`OpenApiFn({ defaultResponseType: 'blob' })` 或 `configureOpenApiResponseType('arraybuffer')`，会写入 Hey `client` 配置，与每次请求的 options 合并。
- **单次覆盖**：生成 SDK 里默认写了 `responseType: 'json'`，但 **`...options` 在其后**，因此在调用里传即可覆盖，例如  
  `downloadFile({ body: {...}, responseType: 'blob' })`。
- **与 base 一起配**：`configureOpenApiBase(url, { responseType: 'stream' })`。

## `openApiHttpClient`

与 SDK 共用实例，可手写流式等：`openApiHttpClient.post(url, body, { responseType: 'stream' })`。跳过全局错误上报：`skipGlobalErrorHandler: true`。

## `openApiSilent`

回调执行期间不触发 `errorHandling.reporter`：`await openApiSilent(() => OpenApiFn().x({ body: {} }))`。

## 其它

- **根入口** `@packages/openapi`：`OpenApiFn`、生成 SDK 方法、`client`、`openApiHttpClient` 等（栈：`@hey-api/openapi-ts` + `axios`）。
- **仅类型** `@packages/openapi/types` → `openapi.types.ts`（`types.gen`），无运行时依赖，便于自建 HTTP 层。
