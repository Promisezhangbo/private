/**
 * Deno Deploy 入口：平台加载本文件并启动 HTTP；请求交给 handleRequest，
 * 与 Node 本地入口共用 handler.js，避免两套路由。
 */
import { handleRequest } from "./handler.js";

Deno.serve(handleRequest);
