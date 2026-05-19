import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  APPS_DIR,
  listRegistryAppNames,
  nextPort,
  readRegistry,
  REPO_ROOT,
  validateAppName,
  writeRegistry,
} from './paths.mjs';
import { runSync } from './sync.mjs';
import { scaffoldMicroApp } from './scaffold.mjs';

async function prompt(question) {
  const rl = readline.createInterface({ input, output });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

function defaultMenuLabel(name) {
  return name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function maxMenuOrder(registry) {
  const orders = registry.apps.map((a) => a.menuOrder ?? 0);
  return orders.length ? Math.max(...orders) : 0;
}

async function cmdCreate() {
  let name = process.argv[3]?.trim();
  if (!name) {
    name = await prompt('请输入新子应用名称（小写，如 demo-app）: ');
  }
  const err = validateAppName(name);
  if (err) {
    console.error(`[micro-app-cli] ${err}`);
    process.exit(1);
  }

  const registry = readRegistry();
  const port = nextPort(registry);
  const menuLabel = defaultMenuLabel(name);
  const description = `新子应用「${menuLabel}」：由 @packages/micro-app-cli 脚手架创建，可在 apps/${name} 中继续开发。`;

  registry.apps.push({
    name,
    port,
    menuLabel,
    menuOrder: maxMenuOrder(registry) + 10,
    entryPath: 'home',
    blogSurface: true,
    description,
    seo: {
      title: `${menuLabel} | 张博`,
      description,
      keywords: `zhangbo, 张博, ${name}, 微前端`,
    },
  });
  writeRegistry(registry);

  scaffoldMicroApp({ name, port, menuLabel, description });
  runSync();

  console.log(`\n完成。请在仓库根目录执行 pnpm install，然后 pnpm dev。`);
  console.log(`访问主应用菜单「${menuLabel}」或 http://localhost:9000/${name}/home`);
}

async function cmdRemove() {
  const registry = readRegistry();
  const names = listRegistryAppNames(registry);
  if (!names.length) {
    console.log('[micro-app-cli] registry 中无子应用可删');
    return;
  }

  let name = process.argv[3]?.trim();
  if (!name) {
    console.log('可删除的子应用：');
    names.forEach((n, i) => console.log(`  ${i + 1}. ${n}`));
    const pick = await prompt('输入序号或名称: ');
    const idx = Number(pick);
    if (Number.isInteger(idx) && idx >= 1 && idx <= names.length) {
      name = names[idx - 1];
    } else {
      name = pick;
    }
  }

  if (!names.includes(name)) {
    console.error(`[micro-app-cli] 无效选择: ${name}`);
    process.exit(1);
  }

  const confirm = await prompt(`确认删除子应用「${name}」及 apps/${name}？(y/N): `);
  if (confirm.toLowerCase() !== 'y') {
    console.log('已取消');
    return;
  }

  registry.apps = registry.apps.filter((a) => a.name !== name);
  writeRegistry(registry);

  const appDir = path.join(APPS_DIR, name);
  if (fs.existsSync(appDir)) {
    fs.rmSync(appDir, { recursive: true, force: true });
    console.log(`[micro-app-cli] 已删除 apps/${name}`);
  }

  const distDir = path.join(REPO_ROOT, 'dist', name);
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  runSync();
  console.log(`\n已删除子应用 ${name}，相关配置与 deploy.yml 已同步`);
}

function cmdSync() {
  runSync();
}

const cmd = process.argv[2];
if (cmd === 'create') {
  await cmdCreate();
} else if (cmd === 'remove') {
  await cmdRemove();
} else if (cmd === 'sync') {
  cmdSync();
} else {
  console.log(`用法:
  micro-app create [name]   创建子应用（交互输入名称）
  micro-app remove [name]   删除子应用（交互选择）
  micro-app sync            从 registry 重新生成各处的注册配置

或: pnpm micro-app:create | pnpm micro-app:remove | pnpm micro-app:sync`);
  process.exit(cmd ? 1 : 0);
}
