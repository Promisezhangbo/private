import type { Context } from "hono";
import { Hono } from "hono";
import * as blogStore from "../db/blogStore";

export const blogRoutes = new Hono();

function bad(c: Context, status: 400 | 404, message: string) {
  return c.json({ error: status === 404 ? "not_found" : "validation_error", message }, status);
}

function dbErr(c: Context, error: unknown, fallback: string) {
  console.error(error);
  return c.json(
    { error: "database_error", message: error instanceof Error ? error.message : fallback },
    503,
  );
}

function intQ(raw: string | undefined, def: number): number {
  if (raw === undefined || raw === "") return def;
  const n = Number(raw);
  return !Number.isFinite(n) || n < 1 ? NaN : Math.floor(n);
}

blogRoutes.get("/getBlogList", async (c) => {
  const page = intQ(c.req.query("page"), 1);
  const pageSize = intQ(c.req.query("pageSize"), 10);
  const name = c.req.query("name");
  if (name != null && name.length > 200) return bad(c, 400, "Query name must be at most 200 characters");
  if (Number.isNaN(page) || Number.isNaN(pageSize)) {
    return bad(c, 400, "Query page and pageSize must be positive integers");
  }
  if (pageSize > 100) return bad(c, 400, "Query pageSize must be at most 100");
  try {
    return c.json(await blogStore.listBlogsPaged(page, pageSize, name ?? undefined));
  } catch (e) {
    return dbErr(c, e, "database query failed");
  }
});

blogRoutes.get("/getBlog", async (c) => {
  const raw = c.req.query("id");
  if (raw === undefined || raw === "") return bad(c, 400, "Query id is required");
  const id = Number(raw);
  if (!Number.isFinite(id) || id < 1 || !Number.isInteger(id)) {
    return bad(c, 400, "Query id must be a positive integer");
  }
  try {
    const row = await blogStore.getBlogById(id);
    if (!row) return bad(c, 404, `No blog with id ${id}`);
    return c.json(row);
  } catch (e) {
    return dbErr(c, e, "database query failed");
  }
});

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
    return bad(c, 400, "Body must include numeric id and non-empty string name");
  }
  try {
    const updated = await blogStore.updateBlogById(id, name);
    if (!updated) return bad(c, 404, `No blog with id ${id}`);
    return c.json(updated);
  } catch (e) {
    return dbErr(c, e, "database update failed");
  }
});
