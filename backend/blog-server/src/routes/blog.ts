import { Hono } from "hono";
import * as blogStore from "../db/blogStore.ts";

export const blogRoutes = new Hono();

/** GET /getBlogList — 有 DATABASE_URL 时读库，否则读内存。 */
blogRoutes.get("/getBlogList", async (c) => {
  try {
    const rows = await blogStore.listBlogs();
    return c.json(rows);
  } catch (error) {
    console.error(error);
    return c.json(
      {
        error: "database_error",
        message: error instanceof Error ? error.message : "database query failed",
      },
      503,
    );
  }
});

/**
 * POST /updateBlogName — 请求体 `{ id, name }`，更新对应条目的名称；
 * 成功返回 `{ id, name, ... }`（与列表中单条结构一致）。
 */
blogRoutes.post("/updateBlogName", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_json", message: "Request body must be JSON" }, 400);
  }

  const rec = body as Record<string, unknown> | null;
  const id = rec?.id;
  const name = rec?.name;

  if (typeof id !== "number" || typeof name !== "string" || name.trim() === "") {
    return c.json(
      { error: "validation_error", message: "Body must include numeric id and non-empty string name" },
      400,
    );
  }

  try {
    const updated = await blogStore.updateBlogById(id, name);
    if (!updated) {
      return c.json({ error: "not_found", message: `No blog with id ${id}` }, 404);
    }
    return c.json(updated);
  } catch (error) {
    console.error(error);
    return c.json(
      {
        error: "database_error",
        message: error instanceof Error ? error.message : "database update failed",
      },
      503,
    );
  }
});
