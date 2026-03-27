/**
 * 从仓库根目录 api/*.yaml 解析（bundle $ref），去掉 tags，
 * 再写入 src/generated（@hey-api/openapi-ts + client-axios）。
 */
import { createClient } from '@hey-api/openapi-ts';
import SwaggerParser from '@apidevtools/swagger-parser';
import { globSync } from 'glob';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(pkgRoot, '../..');
const apiGlob = path.join(repoRoot, 'api', '*.yaml');
const outDir = path.join(pkgRoot, 'src', 'generated');

const files = globSync(apiGlob).sort();
if (files.length === 0) {
  console.warn(`[openapi] 未找到 ${apiGlob}，跳过生成。`);
  process.exit(0);
}

const preferred = files.find((f) => /[/\\]openapi\.yaml$/i.test(f));
const entry = preferred ?? files[0];
if (files.length > 1 && !preferred) {
  console.warn(`[openapi] 多个 YAML，使用 ${path.relative(repoRoot, entry)}（建议将主 spec 命名为 openapi.yaml）。`);
}

const bundled = await SwaggerParser.bundle(entry);

stripOperationTags(bundled);

await fs.promises.rm(outDir, { recursive: true, force: true });

await createClient({
  input: bundled,
  output: outDir,
  plugins: ['@hey-api/client-axios'],
});

patchGeneratedClientGen();
patchGeneratedIndexHeader();

console.log(`[openapi] 已生成 ${path.relative(repoRoot, outDir)}（来源: ${path.relative(repoRoot, entry)}）`);

/** 注入包内 `openApiHttpClient` */
function patchGeneratedClientGen() {
  const clientGenPath = path.join(outDir, 'client.gen.ts');
  let s = fs.readFileSync(clientGenPath, 'utf8');
  if (s.includes('openApiHttpClient')) {
    return;
  }
  s = s.replace(
    "import type { ClientOptions as ClientOptions2 } from './types.gen.js';",
    "import type { ClientOptions as ClientOptions2 } from './types.gen.js';\nimport { openApiHttpClient } from '../open-api-http-client';",
  );
  s = s.replace(
    /createConfig(?:<[^>]*>)?\(\{\s*baseURL:/,
    'createConfig<ClientOptions2>({ axios: openApiHttpClient, baseURL:',
  );
  fs.writeFileSync(clientGenPath, s);
}

function patchGeneratedIndexHeader() {
  const indexPath = path.join(outDir, 'index.ts');
  const rel = path.relative(repoRoot, entry).replace(/\\/g, '/');
  const header = `// 来源: ${rel}（bundle 后由 @hey-api/openapi-ts 生成）\n`;
  let s = fs.readFileSync(indexPath, 'utf8');
  if (s.includes('（bundle 后由 @hey-api/openapi-ts 生成）')) {
    return;
  }
  s = s.replace(/^\/\/ This file is auto-generated.*\n\n?/, (m) => `${m}${header}`);
  fs.writeFileSync(indexPath, s);
}

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);

function stripOperationTags(spec) {
  if (!spec.paths || typeof spec.paths !== 'object') return;
  for (const item of Object.values(spec.paths)) {
    if (!item || typeof item !== 'object') continue;
    for (const key of Object.keys(item)) {
      if (!HTTP_METHODS.has(key)) continue;
      const op = item[key];
      if (op && typeof op === 'object' && 'tags' in op) delete op.tags;
    }
  }
}
