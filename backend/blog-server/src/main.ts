/**
 * Deno Deploy / 本地 Deno 入口：`Deno.serve` + Hono 的 Fetch 适配器。
 */
import { app } from "./app.ts";

Deno.serve(app.fetch);
