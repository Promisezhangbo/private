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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(pkgRoot, '../..');
const apiDir = path.join(repoRoot, 'api');
const genRoot = path.join(pkgRoot, 'gen');

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

const httpSource = path.join(pkgRoot, 'scripts', 'http.ts');

// 先把每个 YAML 都生成到 <name>-gen/（你要的目录结构）
await fs.promises.mkdir(genRoot, { recursive: true });

for (const entry of files) {
  const name = path.basename(entry).replace(/\.ya?ml$/i, '');
  await generateOne({ entry, outRel: `${name}-gen`, label: name });
  writeGenWrappers({ name, outRel: `${name}-gen` });
}

writeClientsBarrel(files.map((f) => path.basename(f).replace(/\.ya?ml$/i, '')));

console.log('[openapi] 已生成所有 <name>-gen/，并写入可初始化入口与 types.ts');

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

  patchGeneratedClientGen(outDir);

  const indexBarrel = path.join(outDir, 'index.ts');
  if (fs.existsSync(indexBarrel)) fs.unlinkSync(indexBarrel);

  console.log(
    `[openapi] 已生成 ${path.relative(repoRoot, outDir)}（${label}，来源: ${path.relative(repoRoot, entry)}）`,
  );
}

function patchGeneratedClientGen(outDir) {
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
  /* 无 servers 时 Hey API 可能生成 createConfig<...>()，需单独注入 axios */
  if (!s.includes('axios: openApiHttpClient')) {
    s = s.replace(
      /createClient\(createConfig(?:<[^>]*>)?\(\s*\)\)/,
      'createClient(createConfig<ClientOptions2>({ axios: openApiHttpClient }))',
    );
  }
  fs.writeFileSync(clientGenPath, s);
}

function toPascal(s) {
  return String(s)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .map((w) => w.slice(0, 1).toUpperCase() + w.slice(1))
    .join('');
}

function writeGenWrappers({ name, outRel }) {
  const pascal = toPascal(name);
  const genDir = path.join(genRoot, outRel);
  const indexPath = path.join(genDir, 'index.ts');
  const typesPath = path.join(genDir, 'types.ts');
  const fnName = `OpenApi${pascal}Fn`;
  const initTypeName = `OpenApi${pascal}FnInit`;
  const resolveName = `resolveOpenApi${pascal}Base`;
  const cfgBaseName = `configureOpenApi${pascal}Base`;
  const cfgRtName = `configureOpenApi${pascal}ResponseType`;

  fs.writeFileSync(typesPath, `/** ${name} 文档生成的类型。 */\nexport type * from './types.gen';\n`, 'utf8');

  fs.writeFileSync(
    indexPath,
    `import type { ResponseType } from 'axios';\n` +
      `import { client } from './client.gen';\n` +
      `import * as sdk from './sdk.gen';\n` +
      `import {\n` +
      `  configureOpenApiErrorHandling,\n` +
      `  openApiSettings,\n` +
      `  type OpenApiAuthState,\n` +
      `  type OpenApiErrorHandlingOptions,\n` +
      `} from './openapi-http.gen';\n` +
      `import { createOpenApiInitializer, resolveBase, type OpenApiCommonInit } from '../../src/request';\n\n` +
      `export type { ResponseType };\n\n` +
      `export type ${initTypeName} = Partial<Pick<OpenApiAuthState, 'BASE' | 'WITH_CREDENTIALS'>> & {\n` +
      `  pathPrefix?: string;\n` +
      `  defaultResponseType?: ResponseType;\n` +
      `  token?: string | (() => string | Promise<string | undefined> | undefined);\n` +
      `  headers?: OpenApiAuthState['HEADERS'];\n` +
      `  errorHandling?: OpenApiErrorHandlingOptions;\n` +
      `};\n\n` +
      `export function ${resolveName}(init: Pick<${initTypeName}, 'BASE' | 'pathPrefix'>): string | undefined {\n` +
      `  return resolveBase(init);\n` +
      `}\n\n` +
      `export function ${cfgBaseName}(baseURL: string, more?: { responseType?: ResponseType }): void {\n` +
      `  openApiSettings.BASE = baseURL;\n` +
      `  client.setConfig({ baseURL, ...more });\n` +
      `}\n\n` +
      `export function ${cfgRtName}(responseType: ResponseType): void {\n` +
      `  client.setConfig({ responseType });\n` +
      `}\n\n` +
      `const init = createOpenApiInitializer({\n` +
      `  sdk,\n` +
      `  client,\n` +
      `  settings: openApiSettings,\n` +
      `  configureErrorHandling: configureOpenApiErrorHandling,\n` +
      `});\n\n` +
      `/** ${name}.yaml 对应的 SDK；在子应用入口初始化 BASE/token（该 spec 可能没有 servers.baseURL）。 */\n` +
      `export function ${fnName}(initArg?: ${initTypeName}): typeof sdk {\n` +
      `  return init(initArg as OpenApiCommonInit);\n` +
      `}\n\n` +
      `export {\n` +
      `  configureOpenApiErrorHandling,\n` +
      `  openApiHttpClient,\n` +
      `  openApiSilent,\n` +
      `  type OpenApiAuthState,\n` +
      `  type OpenApiErrorHandlingOptions,\n` +
      `  type OpenApiErrorReporter,\n` +
      `} from './openapi-http.gen';\n\n` +
      `export { client as client${pascal} } from './client.gen';\n` +
      `export * from './sdk.gen';\n` +
      `export type * from './types';\n`,
    'utf8',
  );
}

function writeClientsBarrel(names) {
  const outPath = path.join(genRoot, 'clients.ts');
  const lines = [
    `/**`,
    ` * AUTO-GENERATED by scripts/generate.mjs`,
    ` *`,
    ` * 目的：让 VSCode/TS 自动导入能直接提示来源于 '@packages/openapi'。`,
    ` * 注意：此文件每次 generate 会覆盖，请勿手改。`,
    ` */`,
    ``,
  ];

  for (const name of names) {
    const pascal = toPascal(name);
    const fn = `OpenApi${pascal}Fn`;
    const init = `OpenApi${pascal}FnInit`;
    const resolve = `resolveOpenApi${pascal}Base`;
    const cfgBase = `configureOpenApi${pascal}Base`;
    const cfgRt = `configureOpenApi${pascal}ResponseType`;

    // 只聚合“具名且不冲突”的初始化入口与其类型；不要聚合 sdk/types/runtime，避免跨 spec 命名冲突。
    lines.push(`export { ${fn}, ${resolve}, ${cfgBase}, ${cfgRt} } from './${name}-gen/index';`);
    lines.push(`export type { ${init} } from './${name}-gen/index';`);
    lines.push('');
  }

  lines.push('');
  fs.writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');
}
