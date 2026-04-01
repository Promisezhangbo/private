import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import readline from 'node:readline/promises';

const repoRoot = process.cwd();
const appsDir = path.join(repoRoot, 'apps');

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
};

function c(text, ...codes) {
  return `${codes.join('')}${text}${ANSI.reset}`;
}

function listApps() {
  if (!fs.existsSync(appsDir)) return [];
  return fs
    .readdirSync(appsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(appsDir, name, 'package.json')))
    .sort();
}

const apps = listApps();
if (apps.length === 0) {
  console.error('[dev] 未找到 apps/*/package.json,无法选择启动项。');
  process.exit(1);
}

const selected = await pickApps(apps);

if (!selected || selected.length === 0) {
  console.error(c('[dev] 未选择任何 app.', ANSI.yellow, ANSI.bold));
  process.exit(1);
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const filters = selected.flatMap((name) => ['--filter', `./apps/${name}...`]);
const args = ['run', 'dev', ...filters];

console.log('');
console.log(
  `${c('[dev]', ANSI.cyan, ANSI.bold)} ${c('启动:', ANSI.gray)}${selected
    .map((s) => c(s, ANSI.bold))
    .join(c(' , ', ANSI.gray))}`,
);
console.log(`${c('[dev]', ANSI.cyan, ANSI.bold)} ${c('command:', ANSI.gray)} turbo ${args.join(' ')}`);
console.log('');

// 通过 pnpm 执行，避免不同环境下找不到 turbo 可执行文件（node_modules/.bin）
const child = spawn('pnpm', ['exec', 'turbo', ...args], {
  stdio: 'inherit',
  env: process.env,
  cwd: repoRoot,
});
child.on('exit', (code) => process.exit(code ?? 0));

async function pickApps(appsList) {
  // 非交互环境（CI/管道）回退到输入模式
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return await pickAppsByPrompt(appsList);
  }
  try {
    return await pickAppsTui(appsList);
  } catch {
    return await pickAppsByPrompt(appsList);
  }
}

async function pickAppsByPrompt(appsList) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const title = `Select the app you need to run ${c('[dev]', ANSI.cyan, ANSI.bold)}`;
  console.log('');
  console.log(c(title, ANSI.bold));
  console.log(c('提示:输入序号,支持逗号/空格分隔(多选)', ANSI.gray));
  console.log('');

  const pad = String(appsList.length).length;
  appsList.forEach((name, idx) => {
    const n = String(idx + 1).padStart(pad, ' ');
    console.log(`  ${c(n, ANSI.yellow)} ${c('>', ANSI.gray)} ${c(name, ANSI.bold)}`);
  });
  console.log('');

  const answerRaw = (await rl.question(c('选择：', ANSI.cyan, ANSI.bold) + ' ')).trim();
  rl.close();

  if (answerRaw === '') return [];
  const parts = answerRaw
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  const idxs = parts
    .map((p) => Number(p))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= appsList.length)
    .map((n) => n - 1);
  return Array.from(new Set(idxs)).map((i) => appsList[i]);
}

async function pickAppsTui(appsList) {
  // 尽量贴近 `npm create vite@latest` 的交互（clack 风格）：多选列表
  // ↑/↓ 移动，Space 勾选/取消，Enter 运行
  const items = [...appsList];
  const pad = String(items.length).length;
  let cursor = 0;
  const checked = new Set();

  const stdin = process.stdin;
  stdin.setEncoding('utf8');
  stdin.setRawMode(true);
  stdin.resume();

  const enterAltScreen = () => process.stdout.write('\x1b[?1049h');
  const exitAltScreen = () => process.stdout.write('\x1b[?1049l');

  const cleanup = () => {
    try {
      stdin.setRawMode(false);
    } catch {
      /* ignore */
    }
    stdin.pause();
    stdin.removeAllListeners('data');
    process.stdout.write('\x1b[?25h'); // show cursor
    exitAltScreen();
  };

  const render = () => {
    // 备用屏幕渲染，避免刷屏堆叠
    process.stdout.write('\x1b[2J\x1b[H\x1b[?25l'); // clear + home + hide cursor
    console.log(
      `${c('?', ANSI.cyan, ANSI.bold)} ${c('Select the app you need to run', ANSI.bold)} ${c(
        '[dev]',
        ANSI.cyan,
        ANSI.bold,
      )}`,
    );
    console.log(c('  Use arrow-keys. Return to submit.', ANSI.gray));
    console.log(c('键盘↑↓移动,空格选择,回车运行命令,q、Esc退出', ANSI.gray));
    console.log('');

    for (let i = 0; i < items.length; i++) {
      const name = items[i];
      const n = String(i + 1).padStart(pad, ' ');
      const active = i === cursor;
      const pointer = active ? c('❯', ANSI.cyan, ANSI.bold) : ' ';
      const mark = checked.has(i) ? c('●', ANSI.cyan, ANSI.bold) : c('○', ANSI.gray);
      const lineName = active ? c(name, ANSI.bold) : name;
      console.log(` ${pointer} ${mark} ${c(n, ANSI.gray)} ${lineName}`);
    }

    console.log('');
  };

  return await new Promise((resolve, reject) => {
    const finish = (ok) => {
      cleanup();
      // 清屏一次，避免菜单残留（保留上方 summary 输出）
      process.stdout.write('\x1b[2J\x1b[H');
      if (!ok) return reject(new Error('cancelled'));
      const out = Array.from(checked)
        .sort((a, b) => a - b)
        .map((i) => items[i]);
      return resolve(out);
    };

    const toggleCurrent = () => {
      // 当前是某个 app：若勾选它，则取消；否则勾选它
      if (checked.has(cursor)) checked.delete(cursor);
      else checked.add(cursor);
    };

    enterAltScreen();
    render();

    stdin.on('data', (chunk) => {
      // ctrl+c
      if (chunk === '\u0003') return finish(false);
      // q / esc
      if (chunk === 'q' || chunk === 'Q' || chunk === '\u001b') return finish(false);
      // enter
      if (chunk === '\r' || chunk === '\n') {
        if (checked.size === 0) {
          // 未选择时给个提示，不退出
          process.stdout.write(c('\n[dev] 未选择任何 app(按 Space 勾选)\n', ANSI.yellow, ANSI.bold));
          return render();
        }
        return finish(true);
      }
      // space toggle
      if (chunk === ' ') {
        toggleCurrent();
        return render();
      }
      // arrows: up/down
      if (chunk === '\u001b[A') {
        cursor = (cursor - 1 + items.length) % items.length;
        return render();
      }
      if (chunk === '\u001b[B') {
        cursor = (cursor + 1) % items.length;
        return render();
      }
      // number quick jump
      if (/^\d$/.test(chunk)) {
        const num = Number(chunk);
        if (num >= 1 && num <= items.length) cursor = num - 1;
        return render();
      }
    });
  });
}
