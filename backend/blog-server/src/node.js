import { createServer } from "node:http";
import { handleRequest } from "./handler.js";

const port = Number(process.env.PORT ?? 8000);
const hostname = process.env.HOST ?? "0.0.0.0";

const server = createServer(async (incomingMessage, serverResponse) => {
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

  const request = new Request(`http://${incomingMessage.headers.host}${incomingMessage.url}`, {
    method: incomingMessage.method,
    headers,
    body: incomingMessage.method === "GET" || incomingMessage.method === "HEAD" ? null : incomingMessage,
    duplex: "half"
  });

  const response = await handleRequest(request);

  serverResponse.writeHead(response.status, Object.fromEntries(response.headers));

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
