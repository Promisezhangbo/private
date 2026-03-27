# @packages/openapi

从仓库根目录 `api/*.yaml` 生成 **一份** Axios SDK；`prepare` 会跑生成，改 spec 后执行：

`pnpm --filter @packages/openapi run generate`

### 多个 YAML 时选哪一个？

| 情况 | 行为 |
|------|------|
| 存在 `api/openapi.yaml` | **始终用它**（与其它 `.yaml` 并存也没关系） |
| 没有 `openapi.yaml`、但有多个 `.yaml` | 取 **按路径名字排序后的第一个**，并在控制台打出警告，建议把主 spec 命名为 `openapi.yaml` |

其它文件可作为 **被 `$ref` 引入的碎片**（由主 yaml bundle 拉进来），不必单独参与上述选择。

若你需要 **两套互不合并的 OpenAPI → 两套客户端**，当前包只维护一个 `src/generated`，需要自行拆包、或复制本包并改 `scripts/generate.mjs` 的入口与输出目录，或把两份 API 合并进同一份 spec（路径/`operationId` 不冲突即可）。

## `OpenApiFn`

```ts
import { OpenApiFn } from '@packages/openapi';

const api = OpenApiFn({
  BASE: '/proxy',
  token: () => localStorage.getItem('t') ?? '',
  headers: { 'X-Tenant': '1' },
  WITH_CREDENTIALS: true,
  errorHandling: { reporter: console.error, debounceMs: 200 },
});

const { data } = await api.listDataset({ body: { request_id: crypto.randomUUID() } });
```

入参见各 `*Data` 类型；不传 `init` 时仍返回同一套方法。

## `openApiHttpClient`

与 SDK 共用实例，可手写流式等：`openApiHttpClient.post(url, body, { responseType: 'stream' })`。跳过全局错误上报：`skipGlobalErrorHandler: true`。

## `openApiSilent`

回调执行期间不触发 `errorHandling.reporter`：`await openApiSilent(() => OpenApiFn().x({ body: {} }))`。

## 其它

`import { client, listDataset, type ListDatasetData } from '@packages/openapi'` 可直接用生成导出。栈：`@hey-api/openapi-ts` + `axios`。
