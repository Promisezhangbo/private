/**
 * 供未启用 Deno LSP 的编辑器 / `tsc` 解析 `Deno` 全局；运行时由 Deno 提供真实实现。
 */
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }

  interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onListen?: (addr: Deno.NetAddr) => void;
  }

  interface HttpServer {
    finished: Promise<void>;
    shutdown(): Promise<void>;
  }

  interface NetAddr {
    transport: "tcp" | "udp";
    hostname: string;
    port: number;
  }

  function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: ServeOptions,
  ): HttpServer;
}
