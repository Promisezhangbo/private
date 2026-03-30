/**
 * 仅导出 OpenAPI 生成的 **类型**（`types.gen.ts`），无 axios、无 SDK 运行时。
 * 适合在应用里自建 `axios`/`fetch` 封装，只从这里拿请求/响应类型。
 *
 * @example
 * import type { ListKnowledgeBasesResponse, KnowledgeBaseListItem } from '@packages/openapi/types';
 * const { data } = await axios.post<ListKnowledgeBasesResponse>(url, body);
 */
export type * from './generated/types.gen';
