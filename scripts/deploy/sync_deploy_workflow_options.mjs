#!/usr/bin/env node
/**
 * 根据 apps 下各子应用（含 package.json 的目录）同步 .github/workflows/deploy.yml 里
 * workflow_dispatch.inputs.scope.options（GitHub 下拉只能是静态 YAML，故用生成 + 提交实现「动态」）。
 *
 * 用法：
 *   node scripts/deploy/sync_deploy_workflow_options.mjs          # 写回文件
 */
import fs from 'node:fs';
import path from 'node:path';
import { listWorkspaceAppNames, REPO_ROOT } from './repo_apps.mjs';

const workflowPath = path.join(REPO_ROOT, '.github/workflows/deploy.yml');

const BEGIN = '# deploy-workflow-options:begin';
const END = '# deploy-workflow-options:end';

function buildOptionsBlock() {
  const indent = '          ';
  const names = ['all', ...listWorkspaceAppNames()];
  return [`${indent}${BEGIN}`, ...names.map((n) => `${indent}- ${n}`), `${indent}${END}`].join('\n');
}

function injectIntoWorkflow(content) {
  const lines = content.split(/\r?\n/);
  let iBegin = lines.findIndex((l) => l.includes(BEGIN));
  let iEnd = lines.findIndex((l) => l.includes(END));

  if (iBegin === -1 || iEnd === -1 || iEnd <= iBegin) {
    console.error(
      `❌ 未在 ${path.relative(REPO_ROOT, workflowPath)} 中找到成对的 ${BEGIN} / ${END} 标记，请检查工作流文件。`,
    );
    process.exit(1);
  }

  const before = lines.slice(0, iBegin);
  const after = lines.slice(iEnd + 1);
  const blockLines = buildOptionsBlock().split('\n');
  return [...before, ...blockLines, ...after].join('\n');
}

const checkOnly = process.argv.includes('--check');
const raw = fs.readFileSync(workflowPath, 'utf8');
const next = injectIntoWorkflow(raw);

if (checkOnly) {
  if (next !== raw) {
    console.error('❌ deploy.yml 中 scope.options 与当前 apps/* 不一致。请运行：');
    console.error('   pnpm run deploy:sync-workflow-options');
    process.exit(1);
  }
  console.log('✅ deploy.yml 中 scope.options 已与 apps/* 同步');
  process.exit(0);
}

if (next === raw) {
  console.log('✅ 无需更新（已同步）');
  process.exit(0);
}

fs.writeFileSync(workflowPath, next, 'utf8');
console.log(`✅ 已更新 ${path.relative(REPO_ROOT, workflowPath)}（scope.options ← apps/*）`);
