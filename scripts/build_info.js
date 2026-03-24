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
// 读取环境变量中的分支（CI 传入）
const branch = process.env.BUILD_BRANCH || 'main';

// 4. 定义要新增的文件内容
const buildInfo = {
  buildTime,
  branch,
  env: 'production',
  timestamp: Date.now(),
  nodeVersion: process.version,
};

// 5. 新增 build-info.json（核心文件）
const buildInfoPath = path.resolve(distDir, 'build-info.json');
fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2), 'utf8');
console.log(`✅ 生成文件：${buildInfoPath}`);

const jsPath = path.resolve(distDir, 'deploy-success.js');
fs.writeFileSync(
  jsPath,
  `// 项目初始化脚本（部署后自动执行）
console.log('🎉 项目部署成功！');
console.log('构建时间："${buildTime}"');
console.log('部署分支："${branch}"');`,
  'utf8',
);
console.log(`✅ 生成文件：${jsPath}`);

console.log('\n📌 所有预构建文件已生成到 dist 目录！');
