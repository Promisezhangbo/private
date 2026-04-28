import { OpenApiBlogServerFn } from '@packages/openapi';
import type { BlogListItem, BlogListPage, UpdateBlogNameRequest } from '@packages/openapi/blog-server-gen-types';

const defaultBlogServerBase = import.meta.env.DEV ? 'http://localhost:8000' : 'https://blog-server.promisezhangbo.deno.net';

const blogServerApi = OpenApiBlogServerFn({
  BASE: import.meta.env.VITE_BLOG_SERVER_BASE || defaultBlogServerBase,
  errorHandling: { reporter: () => {}, debounceMs: 200 },
});

export type ServerBlogItem = BlogListItem;

export type { BlogListPage };

/** GET /getBlogList 分页；可选 `name` 按标题子串筛选（不区分大小写）。 */
export async function getBlogList(params?: {
  page?: number;
  pageSize?: number;
  name?: string;
}): Promise<BlogListPage> {
  const response = await blogServerApi.getBlogList({
    query: {
      page: params?.page,
      pageSize: params?.pageSize,
      name: params?.name,
    },
  });
  if (response.data == null) {
    return {
      items: [],
      total: 0,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    };
  }
  return response.data;
}

/** GET /getBlog?id= — 按主键取单条；不存在时由 axios 层抛错或返回非 2xx，调用方需 catch。 */
export async function getBlog(id: number): Promise<ServerBlogItem> {
  const response = await blogServerApi.getBlog({ query: { id } });
  if (response.data == null) {
    throw new Error('getBlog: empty response');
  }
  return response.data;
}

/** POST /updateBlogName，成功后再次 getBlogList 会得到更新后的 name。 */
export async function updateBlogName(payload: UpdateBlogNameRequest): Promise<ServerBlogItem> {
  const response = await blogServerApi.updateBlogName({ body: payload });
  if (response.data == null) {
    throw new Error('updateBlogName: empty response');
  }
  return response.data;
}
