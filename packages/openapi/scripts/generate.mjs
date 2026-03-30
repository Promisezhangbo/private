/**
 * 从仓库根目录 api/*.yaml 解析（bundle $ref），写入 src/generated（@hey-api/openapi-ts + client-axios）。
 */
import { createClient } from '@hey-api/openapi-ts';
import SwaggerParser from '@apidevtools/swagger-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(pkgRoot, '../..');
const apiDir = path.join(repoRoot, 'api');
const outDir = path.join(pkgRoot, 'src', 'generated');

const files = fs.existsSync(apiDir)
  ? fs
      .readdirSync(apiDir)
      .filter((f) => /\.ya?ml$/i.test(f))
      .map((f) => path.join(apiDir, f))
      .sort()
  : [];

if (files.length === 0) {
  console.warn(`[openapi] 未找到 ${apiDir} 下的 *.yaml，跳过生成。`);
  process.exit(0);
}

const preferred = files.find((f) => /[/\\]openapi\.yaml$/i.test(f));
const entry = preferred ?? files[0];
if (files.length > 1 && !preferred) {
  console.warn(`[openapi] 多个 YAML，使用 ${path.relative(repoRoot, entry)}（建议主 spec 命名为 openapi.yaml）。`);
}

const bundled = await SwaggerParser.bundle(entry);

await fs.promises.rm(outDir, { recursive: true, force: true });

await createClient({
  input: bundled,
  output: outDir,
  plugins: ['@hey-api/client-axios'],
});

const httpSource = path.join(pkgRoot, 'scripts', 'openapi-http.gen.ts');
fs.copyFileSync(httpSource, path.join(outDir, 'openapi-http.gen.ts'));

patchGeneratedClientGen();

const indexBarrel = path.join(outDir, 'index.ts');
if (fs.existsSync(indexBarrel)) fs.unlinkSync(indexBarrel);

console.log(`[openapi] 已生成 ${path.relative(repoRoot, outDir)}（来源: ${path.relative(repoRoot, entry)}）`);

function patchGeneratedClientGen() {
  const clientGenPath = path.join(outDir, 'client.gen.ts');
  let s = fs.readFileSync(clientGenPath, 'utf8');
  s = s.replace(/import \{ openApiHttpClient \} from '\.\.\/openapi-http';?\r?\n?/, '');
  s = s.replace(/import \{ openApiHttpClient \} from "\.\.\/openapi-http";?\r?\n?/, '');
  if (!s.includes("from './openapi-http.gen.js'")) {
    s = s.replace(
      "import type { ClientOptions as ClientOptions2 } from './types.gen.js';",
      "import type { ClientOptions as ClientOptions2 } from './types.gen.js';\nimport { openApiHttpClient } from './openapi-http.gen.js';",
    );
  }
  if (!s.includes('axios: openApiHttpClient')) {
    s = s.replace(
      /createConfig(?:<[^>]*>)?\(\{\s*baseURL:/,
      'createConfig<ClientOptions2>({ axios: openApiHttpClient, baseURL:',
    );
  }
  fs.writeFileSync(clientGenPath, s);
}
