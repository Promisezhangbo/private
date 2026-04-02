/**
 * 从 monorepo 根目录读取 `.env.deploy.local`，将其中 `VITE_*` 行写入当前进程的 `process.env`（供 Vite `define` 使用）。
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {string} monorepoRoot 含 `apps/`、`scripts/` 的仓库根绝对路径
 */
export function loadDeployEnv(monorepoRoot) {
  const file = path.join(monorepoRoot, '.env.deploy.local');
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key.startsWith('VITE_')) continue;
    let val = trimmed.slice(eq + 1).trim();
    try {
      val = JSON.parse(val);
    } catch {
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
    }
    process.env[key] = val;
  }
}

/** @returns {Record<string, string>} */
export function deployTagDefine() {
  return {
    'import.meta.env.VITE_DEPLOY_TAG': JSON.stringify(process.env.VITE_DEPLOY_TAG ?? ''),
  };
}
