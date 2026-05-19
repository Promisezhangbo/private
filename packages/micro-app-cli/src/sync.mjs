import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { GENERATED, readRegistry, REPO_ROOT } from './paths.mjs';

const GENERATED_BANNER = `/** AUTO-GENERATED — 请勿手改。运行 pnpm micro-app:sync 或 create/remove 后自动更新。 */\n`;

function menuPathForApp(app) {
  if (app.entryPath === 'list') return `/${app.name}/list`;
  if (app.entryPath === 'root') return `/${app.name}`;
  return `/${app.name}/home`;
}

function sortedApps(registry) {
  return [...registry.apps].sort((a, b) => (a.menuOrder ?? 999) - (b.menuOrder ?? 999));
}

export function generateMicroAppsDev(registry) {
  const apps = [...registry.apps].sort((a, b) => a.port - b.port);
  const lines = apps.map(
    (a) => `  { name: '${a.name}', port: ${a.port}, prodBase: '/${a.name}/', activeRule: '/${a.name}' },`,
  );
  return `${GENERATED_BANNER}/**
 * 微应用开发期端口、路由前缀与生产 entry 路径。
 * 数据源：packages/micro-app-cli/micro-apps.registry.json
 * - \`qiankun.ts\` 据此生成 \`apps\`
 * - \`vite.config.ts\` 据此生成 \`server.proxy\`
 */
export const microAppsDev = [
${lines.join('\n')}
] as const;
`;
}

export function generateMainShell(registry) {
  const apps = sortedApps(registry);
  const menuEntries = apps
    .map((a) => `  { key: '${a.name}', label: '${a.menuLabel}', sub: true },`)
    .join('\n');
  const pathEntries = apps.map((a) => `  ${a.name}: '${menuPathForApp(a)}',`).join('\n');
  const blogKeys = apps.filter((a) => a.blogSurface).map((a) => `'${a.name}'`).join(', ');

  return `${GENERATED_BANNER}
export const microAppMenuEntries = [
${menuEntries}
] as const;

export const microAppMenuPaths: Record<string, string> = {
${pathEntries}
};

export const microAppBlogSurfaceKeys = [${blogKeys}] as const;
`;
}

export function generateHomeMicroApps(registry) {
  const apps = sortedApps(registry);
  const blocks = apps.map(
    (a) => `  {
    key: '${a.name}',
    name: '${a.name}',
    path: '/${a.name}',
    devPort: '${a.port}',
    role: '子应用',
    desc: ${JSON.stringify(a.description)},
  },`,
  );
  return `${GENERATED_BANNER}
export const MICRO_APP_SUB_APPS = [
${blocks.join('\n')}
] as const;
`;
}

export function generateSeoPresets(registry) {
  const apps = registry.apps;
  const entries = apps.map((a) => {
    const seo = a.seo ?? {};
    const parts = [
      `  ${a.name}: {`,
      `    title: ${JSON.stringify(seo.title ?? `${a.menuLabel} | 张博`)},`,
      `    description: ${JSON.stringify(seo.description ?? a.description ?? '')},`,
    ];
    if (seo.keywords) parts.push(`    keywords: ${JSON.stringify(seo.keywords)},`);
    if (seo.robots) parts.push(`    robots: ${JSON.stringify(seo.robots)},`);
    parts.push('  },');
    return parts.join('\n');
  });
  return `${GENERATED_BANNER}
export const microAppSeoPresets = {
${entries.join('\n')}
} as const;
`;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeGenerated(filePath, content) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content, 'utf8');
}

export function runSync({ deployWorkflow = true } = {}) {
  const registry = readRegistry();
  writeGenerated(GENERATED.microAppsDev, generateMicroAppsDev(registry));
  writeGenerated(GENERATED.mainShell, generateMainShell(registry));
  writeGenerated(GENERATED.homeMicroApps, generateHomeMicroApps(registry));
  writeGenerated(GENERATED.seoPresets, generateSeoPresets(registry));

  if (deployWorkflow) {
    try {
      execSync('pnpm deploy:sync-workflow-options', { cwd: REPO_ROOT, stdio: 'inherit' });
    } catch {
      console.warn('[micro-app-cli] deploy:sync-workflow-options 失败，请稍后手动执行');
    }
  }

  console.log('[micro-app-cli] 已同步：microAppsDev、主应用菜单、首页子应用表、SEO presets');
  return registry;
}
