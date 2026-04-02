/**
 * 在 dist 中生成 deploy-success.js（控制台部署信息）。
 * - 逻辑集中在本文件；可按子应用名配置不同文案 / 样式。
 * - 无需改 Vite 或提前注入构建 env：在 build 之后写静态脚本即可。
 *
 * 用法：
 *   node scripts/deploy/build_tag_info.js <scope>
 *   scope: all | 子应用目录名（与 workflow inputs.scope 一致）
 *
 * 环境变量：
 *   BUILD_BRANCH — 可选，显示在日志中
 *
 * 产物：
 *   - dist/deploy-success.js — 站点根（供 main 的 index 引用 /deploy-success.js）
 *   - dist/<app>/deploy-success.js — 各子应用目录（需在对应 index 中引用，如 ./deploy-success.js）
 */
import fs from 'node:fs';
import path from 'node:path';
import { listWorkspaceAppNames, REPO_ROOT } from './repo_apps.mjs';

const distDir = path.join(REPO_ROOT, 'dist');

const scope = (process.argv[2] ?? process.env.DEPLOY_SCOPE ?? '').trim();
const buildBranch = process.env.BUILD_BRANCH ?? '';

function formatShanghaiBuildTime() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:${get('second')}`;
}

/**
 * 每个子应用可单独配置：返回要在浏览器里执行的 console 语句片段（已是安全 JSON 字符串的内容行）。
 * 未配置的应用走 default。
 */
const TAG_PRESETS = {
  main: {
    emoji: '🎉',
    title: '主应用',
    style: 'color: #14b8a6; font-size: 18px; font-weight: bold;',
  },
  login: {
    emoji: '🔐',
    title: '登录子应用',
    style: 'color: #0d9488; font-size: 16px; font-weight: bold;',
  },
  blog: {
    emoji: '📝',
    title: 'Blog',
    style: 'color: #0284c7; font-size: 16px; font-weight: bold;',
  },
  agent: {
    emoji: '🤖',
    title: 'AI Agent',
    style: 'color: #06b6d4; font-size: 16px; font-weight: bold;',
  },
  skill: {
    emoji: '📊',
    title: '技能',
    style: 'color: #059669; font-size: 16px; font-weight: bold;',
  },
  resume: {
    emoji: '📄',
    title: '简历',
    style: 'color: #4f46e5; font-size: 16px; font-weight: bold;',
  },
  default: {
    emoji: '✅',
    title: '子应用',
    style: 'color: #48a19e; font-size: 16px; font-weight: bold;',
  },
};

function presetFor(appName) {
  return TAG_PRESETS[appName] ?? TAG_PRESETS.default;
}

function buildScriptSource(appName, ctx) {
  const { buildTime, branch, deployMode } = ctx;
  const p = presetFor(appName);
  const line1 = `${p.emoji} ${p.title} 已部署`;
  const line2 = `【${appName}】 ${buildTime}`;

  return `(function () {
  var branch = ${JSON.stringify(branch)};
  var mode = ${JSON.stringify(deployMode)};
  console.log(${JSON.stringify(line1)});
  console.log('%c' + ${JSON.stringify(line2)}, ${JSON.stringify(p.style)});
  console.log('部署分支：' + branch);
  console.log('部署方式：' + mode);
})();`;
}

function writeDeploySuccessJs(targetPath, appName, ctx) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const src = buildScriptSource(appName, ctx);
  fs.writeFileSync(targetPath, `${src}\n`, 'utf8');
  console.log(`✅ 生成：${path.relative(REPO_ROOT, targetPath)}`);
}

function distAppDirsPresent() {
  return listWorkspaceAppNames().filter(
    (name) => fs.existsSync(path.join(distDir, name)) && fs.statSync(path.join(distDir, name)).isDirectory(),
  );
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log(`✅ 创建 dist：${distDir}`);
}

const buildTime = formatShanghaiBuildTime();

if (scope === 'all') {
  const apps = distAppDirsPresent();
  if (apps.length === 0) {
    console.warn('⚠️ dist 下未发现任何子应用目录，仅写入根 deploy-success.js');
  }
  const ctx = { buildTime, branch: buildBranch, deployMode: '全量 (all)' };
  for (const app of apps) {
    writeDeploySuccessJs(path.join(distDir, app, 'deploy-success.js'), app, ctx);
  }
  writeDeploySuccessJs(path.join(distDir, 'deploy-success.js'), 'main', {
    ...ctx,
    deployMode: '全量 (all) · 根入口',
  });
} else if (scope) {
  const appDir = path.join(distDir, scope);
  if (!fs.existsSync(appDir)) {
    console.error(`❌ dist/${scope} 不存在，请先完成对应子应用构建`);
    process.exit(1);
  }
  const ctx = { buildTime, branch: buildBranch, deployMode: `单应用 (${scope})` };
  writeDeploySuccessJs(path.join(distDir, scope, 'deploy-success.js'), scope, ctx);
  if (scope === 'main') {
    writeDeploySuccessJs(path.join(distDir, 'deploy-success.js'), 'main', {
      ...ctx,
      deployMode: '单应用 (main) · 含根入口',
    });
  }
} else {
  console.error('❌ 请传入 scope：all 或子应用名，例：node scripts/deploy/build_tag_info.js login');
  process.exit(1);
}
