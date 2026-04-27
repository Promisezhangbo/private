import { OpenApiBlogServerFn } from '@packages/openapi';
import type { BlogListItem } from '@packages/openapi/blog-server-gen-types';

const defaultBlogServerBase = import.meta.env.DEV ? 'http://localhost:8000' : 'https://blog-server.deno.dev';

const blogServerApi = OpenApiBlogServerFn({
  BASE: import.meta.env.VITE_BLOG_SERVER_BASE || defaultBlogServerBase,
  errorHandling: { reporter: () => {}, debounceMs: 200 },
});

export type ServerBlogItem = BlogListItem;

export async function getBlogList(): Promise<ServerBlogItem[]> {
  const response = await blogServerApi.getBlogList();
  return response.data ?? [];
}
