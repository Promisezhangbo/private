/** 定时任务入口：转调各业务目录的注册逻辑。 */
import { registerAllBusinessJobs } from "../business/index.ts";

export function registerAllJobs(): void {
  registerAllBusinessJobs();
}
