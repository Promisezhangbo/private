/** 编辑器 / tsc 用最小 `Deno` 声明；运行时由 Deno 提供。 */
interface ImportMeta {
  /** Deno：`deno run` 入口时为 true；参见 https://docs.deno.com/api/deno/~/ImportMeta.main */
  readonly main: boolean;
}

declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
  function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: { port?: number; hostname?: string },
  ): { shutdown(): Promise<void> };
}
