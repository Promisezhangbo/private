/** 与业务无关的系统类路由：健康检查、爬虫协议等。 */
import { json, text } from "../utils/response.js";

/** 存活探针，供负载均衡或人工 curl。 */
export function getHealth() {
  return json({
    name: "blog-server",
    status: "ok",
    runtime: "fetch",
    timestamp: new Date().toISOString()
  });
}

/** 极简 robots.txt，可按需收紧规则。 */
export function getRobots() {
  return text("User-agent: *\nAllow: /\n");
}
