/**
 * 从仓库根目录 api 下的 YAML 生成客户端。
 *
 * 设计目标：一个 YAML = 一套独立运行时（axios/settings/client），避免不同域名/Token/baseURL 相互覆盖。
 *
 * - 每个 *.yaml  → src/<name>-gen
 *
 * 每个 <name>-gen/ 目录包含：
 * - openapi-ts 生成的 core/client/sdk/types 等
 * - 注入的 openapi-http.gen.ts（axios + settings + 拦截器）
 * - 我们写入的 index.ts（OpenApi<Name>Fn({ BASE, token... }) 可初始化入口）
 * - 我们写入的 types.ts（仅类型 re-export）
 */
import { createClient } from '@hey-api/openapi-ts';
import SwaggerParser from '@apidevtools/swagger-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCacheKey,
  canUseCache,
  listYamlFiles,
  writeCache,
} from './cache-utils.mjs';
import {
  patchGeneratedClientGen,
  writeClientsBarrel,
  writeGenWrappers,
} from './codegen-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(pkgRoot, '../..');
const apiDir = path.join(repoRoot, 'api');
const genRoot = path.join(pkgRoot, 'gen');

const files = listYamlFiles(apiDir);

if (files.length === 0) {
  console.warn(`[openapi] 未找到 ${apiDir} 下的 *.yaml，跳过生成。`);
  process.exit(0);
}

const httpSource = path.join(pkgRoot, 'scripts', 'http.ts');

// --- 轻量缓存：若 api/*.yaml 与模板未变，则跳过生成 ---
await fs.promises.mkdir(genRoot, { recursive: true });
const cachePath = path.join(genRoot, '.cache.json');
const cacheKey = buildCacheKey({ repoRoot, yamlFiles: files, templateFile: httpSource });
if (canUseCache({ genRoot, cachePath, cacheKey, yamlFiles: files })) {
  console.log('[openapi] yaml 没更新，正在使用 openapi 缓存（跳过 generate）');
  process.exit(0);
}

// 先把每个 YAML 都生成到 <name>-gen/（你要的目录结构）
await fs.promises.mkdir(genRoot, { recursive: true });

for (const entry of files) {
  const name = path.basename(entry).replace(/\.ya?ml$/i, '');
  await generateOne({ entry, outRel: `${name}-gen`, label: name });
  writeGenWrappers({ genRoot, name, outRel: `${name}-gen` });
}

writeClientsBarrel({
  genRoot,
  names: files.map((f) => path.basename(f).replace(/\.ya?ml$/i, '')),
});

console.log('[openapi] 已生成所有 <name>-gen/，并写入可初始化入口与 types.ts');
writeCache({ cachePath, cacheKey });

async function generateOne({ entry, outRel, label }) {
  const bundled = await SwaggerParser.bundle(entry);
  const outDir = path.join(genRoot, outRel);

  await fs.promises.rm(outDir, { recursive: true, force: true });

  await createClient({
    input: bundled,
    output: outDir,
    plugins: ['@hey-api/client-axios'],
  });

  fs.copyFileSync(httpSource, path.join(outDir, 'openapi-http.gen.ts'));

  patchGeneratedClientGen({ clientGenPath: path.join(outDir, 'client.gen.ts') });

  const indexBarrel = path.join(outDir, 'index.ts');
  if (fs.existsSync(indexBarrel)) fs.unlinkSync(indexBarrel);

  console.log(
    `[openapi] 已生成 ${path.relative(repoRoot, outDir)}（${label}，来源: ${path.relative(repoRoot, entry)}）`,
  );
}
