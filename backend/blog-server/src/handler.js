/**
 * HTTP 请求总入口：解析 URL、处理 CORS 预检、按路由表分发。
 * 新增接口：在 routes/ 实现 handler，再在下方的 routes 数组注册。
 */
import { getBlogList, updateBlogName } from "./routes/blog.js";
import { getHealth, getRobots } from "./routes/system.js";
import { methodNotAllowed, notFound, preflight } from "./utils/response.js";

// 新增接口时，在这里加一条路由即可；具体业务逻辑放到 routes/ 下。
const routes = [
  { method: "GET", pathname: "/", handler: getHealth },
  { method: "GET", pathname: "/health", handler: getHealth },
  { method: "GET", pathname: "/getBlogList", handler: getBlogList },
  { method: "POST", pathname: "/updateBlogName", handler: updateBlogName },
  { method: "GET", pathname: "/robots.txt", handler: getRobots }
];

/** 供 Deno.serve 与 Node createServer 共用。 */
export async function handleRequest(request) {
  const url = new URL(request.url);

  // 浏览器跨域请求会先发 OPTIONS 预检，直接返回允许访问。
  if (request.method === "OPTIONS") {
    return preflight();
  }

  // 精确匹配 method + pathname。
  const route = routes.find((item) => item.method === request.method && item.pathname === url.pathname);
  if (route) return route.handler(request, url);

  // 路径命中但方法不对：返回 405 并列出该路径允许的动词。
  const matchedPathRoutes = routes.filter((item) => item.pathname === url.pathname);
  if (matchedPathRoutes.length > 0) {
    const allowedMethods = [...new Set([...matchedPathRoutes.map((item) => item.method), "OPTIONS"])];
    return methodNotAllowed(request.method, allowedMethods);
  }

  return notFound(url.pathname);
}
