/**
 * CI 用：`deno check` 校验 TypeScript 与依赖解析（替代递归 node --check .js）。
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync("deno", ["check", "src/main.ts"], {
  cwd: root,
  stdio: "inherit",
});
if (result.status !== 0) process.exit(result.status ?? 1);
