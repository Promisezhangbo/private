/** 博客相关 API 路由实现。 */
import * as blogStore from "../db/blogStore.js";
import { json } from "../utils/response.js";

/** GET /getBlogList — 有 DATABASE_URL 时读库，否则读内存。 */
export async function getBlogList() {
  try {
    const rows = await blogStore.listBlogs();
    return json(rows);
  } catch (error) {
    console.error(error);
    return json(
      { error: "database_error", message: error instanceof Error ? error.message : "database query failed" },
      { status: 503 }
    );
  }
}

/**
 * POST /updateBlogName — 请求体 `{ id, name }`，更新对应条目的名称；
 * 成功返回 `{ id, name }`（与列表中单条结构一致）。
 */
export async function updateBlogName(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json", message: "Request body must be JSON" }, { status: 400 });
  }

  const { id, name } = body ?? {};
  if (typeof id !== "number" || typeof name !== "string" || name.trim() === "") {
    return json(
      { error: "validation_error", message: "Body must include numeric id and non-empty string name" },
      { status: 400 }
    );
  }

  try {
    const updated = await blogStore.updateBlogById(id, name);
    if (!updated) {
      return json({ error: "not_found", message: `No blog with id ${id}` }, { status: 404 });
    }
    return json(updated);
  } catch (error) {
    console.error(error);
    return json(
      { error: "database_error", message: error instanceof Error ? error.message : "database update failed" },
      { status: 503 }
    );
  }
}
