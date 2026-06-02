/** 编辑器 / tsc 用最小 `Deno` 声明；运行时由 Deno 提供。 */
interface ImportMeta {
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
  /** 注册 cron 定时任务；Deno Deploy 平台亦支持。 */
  function cron(
    name: string,
    schedule: string,
    handler: () => void | Promise<void>,
  ): void;
}
