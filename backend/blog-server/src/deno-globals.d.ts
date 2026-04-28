/** 编辑器 / tsc 用最小 `Deno` 声明；运行时由 Deno 提供。 */
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
  function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: { port?: number; hostname?: string },
  ): { shutdown(): Promise<void> };
}
