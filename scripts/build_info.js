import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. 定义项目根目录和 dist 目录路径
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// 2. 确保 dist 目录存在（Build 前可能未生成）
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log(`✅ 创建 dist 目录：${distDir}`);
}

// 3. 东八区构建时间（Intl，无额外依赖）
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

const buildTime = formatShanghaiBuildTime();

const jsPath = path.resolve(distDir, 'deploy-success.js');

fs.writeFileSync(
  jsPath,
  `
console.log('🎉 项目部署成功！');
console.log('构建时间："${buildTime}"');
console.log('部署分支："${process.env.BUILD_BRANCH || ''}"');`,
  'utf8',
);
console.log(`✅ 生成文件：${jsPath}`);
