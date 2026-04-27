/** 博客相关 API 路由实现。 */
import { json } from "../utils/response.js";

/** 内存列表；updateBlogName 会就地修改，getBlogList 始终读到最新。 */
let blogList = [{ id: 1, name: "我是一个blog" }];

/** GET /getBlogList — 返回博客列表 JSON。 */
export function getBlogList() {
  return json(blogList);
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

  const item = blogList.find((b) => b.id === id);
  if (!item) {
    return json({ error: "not_found", message: `No blog with id ${id}` }, { status: 404 });
  }

  item.name = name;
  return json({ id: item.id, name: item.name });
}
