#!/usr/bin/env node
/**
 * CI / 本地：校验 GitHub Actions「部署范围」参数。
 * - all：构建全部 apps(与 pnpm run build 一致)
 * - 其它：须为 apps/<name>/package.json 存在的目录名(与 pnpm package name 一致)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const appsDir = path.join(root, 'apps');

function listApps() {
  if (!fs.existsSync(appsDir)) return [];
  return fs
    .readdirSync(appsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(appsDir, name, 'package.json')))
    .sort();
}

const scope = (process.argv[2] ?? '').trim();
if (scope === 'all') {
  console.log('✅ deploy scope: all(将构建 apps/* 全部子应用)');
  process.exit(0);
}

if (!scope) {
  console.error('❌ 未传入部署范围，应为 all 或子应用目录名');
  process.exit(1);
}

const apps = listApps();
if (apps.includes(scope)) {
  console.log(`✅ deploy scope: ${scope}`);
  process.exit(0);
}

console.error(`❌ 无效的部署范围: "${scope}"`);
console.error(`   请使用 all,或以下之一: ${apps.join(', ')}`);
process.exit(1);
