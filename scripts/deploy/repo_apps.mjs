/**
 * 与 Turbo「apps/* 子应用」一致的目录枚举，供部署脚本共用。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(__dirname, '../..');
export const APPS_DIR = path.join(REPO_ROOT, 'apps');

/** `apps/<name>/package.json` 存在的目录名，已排序 */
export function listWorkspaceAppNames() {
  if (!fs.existsSync(APPS_DIR)) return [];
  return fs
    .readdirSync(APPS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(APPS_DIR, name, 'package.json')))
    .sort((a, b) => a.localeCompare(b));
}
