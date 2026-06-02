/** 网络层：系统路由 + 各业务渠道路由。 */
import { Hono } from "hono";
import { createBusinessRouter } from "../business/index.ts";
import { systemRoutes } from "./system.ts";

export const routes = new Hono();
routes.route("/", systemRoutes);
routes.route("/", createBusinessRouter());
