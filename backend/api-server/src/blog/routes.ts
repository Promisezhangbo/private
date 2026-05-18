/** Blog HTTP 路由；OpenAPI 见 `api/api-server.yaml`。 */
import { Hono } from "hono";
import { jsonBad, jsonDbErr, parsePageQuery, readJsonBody } from "../core/http.ts";
import { parsePositiveIntQuery } from "../core/validate.ts";
import * as blogStore from "./store.ts";

export const blogRoutes = new Hono();

blogRoutes.get("/getBlogList", async (c) => {
  const { page, pageSize, error } = parsePageQuery(c);
  const name = c.req.query("name");
  if (error) return jsonBad(c, 400, error);
  if (name != null && name.length > 200) return jsonBad(c, 400, "Query name must be at most 200 characters");
  try {
    return c.json(await blogStore.listBlogsPaged(page, pageSize, name ?? undefined));
  } catch (e) {
    return jsonDbErr(c, e, "database query failed");
  }
});

blogRoutes.get("/getBlog", async (c) => {
  const id = parsePositiveIntQuery(c.req.query("id"));
  if (id === "missing") return jsonBad(c, 400, "Query id is required");
  if (id === "invalid") return jsonBad(c, 400, "Query id must be a positive integer");
  try {
    const row = await blogStore.getBlogById(id);
    if (!row) return jsonBad(c, 404, `No blog with id ${id}`);
    return c.json(row);
  } catch (e) {
    return jsonDbErr(c, e, "database query failed");
  }
});

blogRoutes.post("/updateBlogName", async (c) => {
  const body = await readJsonBody(c);
  if (body instanceof Response) return body;
  const id = body.id;
  const name = body.name;
  if (typeof id !== "number" || typeof name !== "string" || name.trim() === "") {
    return jsonBad(c, 400, "Body must include numeric id and non-empty string name");
  }
  try {
    const updated = await blogStore.updateBlogById(id, name);
    if (!updated) return jsonBad(c, 404, `No blog with id ${id}`);
    return c.json(updated);
  } catch (e) {
    return jsonDbErr(c, e, "database update failed");
  }
});
