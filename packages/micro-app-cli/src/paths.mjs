import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PKG_ROOT = path.resolve(__dirname, '..');
export const REPO_ROOT = path.resolve(PKG_ROOT, '../..');
export const REGISTRY_PATH = path.join(PKG_ROOT, 'micro-apps.registry.json');
export const APPS_DIR = path.join(REPO_ROOT, 'apps');
export const TEMPLATES_DIR = path.join(PKG_ROOT, 'templates');

export const GENERATED = {
  microAppsDev: path.join(REPO_ROOT, 'apps/main/src/utils/microAppsDev.ts'),
  mainShell: path.join(REPO_ROOT, 'apps/main/src/generated/micro-app-shell.generated.ts'),
  homeMicroApps: path.join(REPO_ROOT, 'apps/main/src/pages/home/microApps.generated.ts'),
  seoPresets: path.join(REPO_ROOT, 'packages/seo/src/micro-app-seo.generated.ts'),
};

export const RESERVED_APP_NAMES = new Set(['main', 'packages', 'backend', 'api', 'dist', 'node_modules']);

export function readRegistry() {
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.apps)) throw new Error('micro-apps.registry.json: apps must be an array');
  return data;
}

export function writeRegistry(data) {
  fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function listRegistryAppNames(registry = readRegistry()) {
  return registry.apps.map((a) => a.name).sort((a, b) => a.localeCompare(b));
}

export function nextPort(registry = readRegistry()) {
  const ports = registry.apps.map((a) => a.port);
  const max = ports.length ? Math.max(...ports) : 9000;
  return max + 1;
}

export function validateAppName(name) {
  const n = name.trim();
  if (!/^[a-z][a-z0-9-]*$/.test(n)) {
    return '名称须为小写字母开头，仅含小写字母、数字与连字符（如 my-demo）';
  }
  if (RESERVED_APP_NAMES.has(n)) return `「${n}」为保留名称，请换一个`;
  if (fs.existsSync(path.join(APPS_DIR, n))) return `apps/${n} 已存在`;
  if (readRegistry().apps.some((a) => a.name === n)) return `registry 中已有 ${n}`;
  return null;
}
