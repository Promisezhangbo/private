/**
 * 递归对 src 下所有 .js 执行 `node --check`，用于 CI / pnpm build，避免手写一长串文件路径。
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** blog-server 源码根目录。 */
const root = path.resolve(import.meta.dirname, "..", "src");

/** 深度优先列出目录下全部 .js 文件。 */
function listJsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listJsFiles(fullPath) : fullPath.endsWith(".js") ? [fullPath] : [];
  });
}

for (const file of listJsFiles(root)) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
