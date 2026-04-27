/**
 * 本地 Node.js 入口：把 Node 的 IncomingMessage 转成标准 Fetch Request，
 * 再交给 handleRequest，这样与 Deno Deploy 共用同一份路由与业务逻辑。
 */
import { createServer } from "node:http";
import { handleRequest } from "./handler.js";

/** 监听端口，部署平台一般会注入 PORT。 */
const port = Number(process.env.PORT ?? 8000);
/** 绑定地址，容器内常用 0.0.0.0。 */
const hostname = process.env.HOST ?? "0.0.0.0";

const server = createServer(async (incomingMessage, serverResponse) => {
  // Node 的 headers 可能是 string | string[]，统一转成 Headers 供 Request 使用。
  const headers = new Headers();
  for (const [key, value] of Object.entries(incomingMessage.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  // 组装 Fetch API 的 Request，url 需含 host，便于 handler 内 new URL(request.url)。
  const request = new Request(`http://${incomingMessage.headers.host}${incomingMessage.url}`, {
    method: incomingMessage.method,
    headers,
    body: incomingMessage.method === "GET" || incomingMessage.method === "HEAD" ? null : incomingMessage,
    duplex: "half"
  });

  const response = await handleRequest(request);

  serverResponse.writeHead(response.status, Object.fromEntries(response.headers));

  // 将 Fetch Response 的 body 流写回 Node ServerResponse。
  if (response.body) {
    await response.body.pipeTo(
      new WritableStream({
        write(chunk) {
          serverResponse.write(chunk);
        },
        close() {
          serverResponse.end();
        },
        abort(error) {
          serverResponse.destroy(error);
        }
      })
    );
    return;
  }

  serverResponse.end();
});

server.listen(port, hostname, () => {
  console.log(`blog-server listening on http://${hostname}:${port}`);
});
