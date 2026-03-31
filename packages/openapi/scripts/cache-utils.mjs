import fs from 'node:fs';
import path from 'node:path';

export function listYamlFiles(apiDir) {
  if (!fs.existsSync(apiDir)) return [];
  return fs
    .readdirSync(apiDir)
    .filter((f) => /\.ya?ml$/i.test(f))
    .map((f) => path.join(apiDir, f))
    .sort();
}

function fileFingerprint(p) {
  const st = fs.statSync(p);
  return { mtimeMs: st.mtimeMs, size: st.size };
}

export function buildCacheKey({ repoRoot, yamlFiles, templateFile }) {
  const list = yamlFiles.map((p) => ({
    path: path.relative(repoRoot, p),
    ...fileFingerprint(p),
  }));
  const template = { path: path.relative(repoRoot, templateFile), ...fileFingerprint(templateFile) };
  return { v: 1, yaml: list, template };
}

export function canUseCache({ genRoot, cachePath, cacheKey, yamlFiles }) {
  if (!fs.existsSync(cachePath)) return false;

  // 生成产物存在性检查（防止 cache 存在但 gen 目录被清空）
  const clients = path.join(genRoot, 'clients.ts');
  if (!fs.existsSync(clients)) return false;
  for (const p of yamlFiles) {
    const name = path.basename(p).replace(/\.ya?ml$/i, '');
    const dir = path.join(genRoot, `${name}-gen`);
    if (!fs.existsSync(dir)) return false;
  }

  try {
    const old = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    return JSON.stringify(old) === JSON.stringify(cacheKey);
  } catch {
    return false;
  }
}

export function writeCache({ cachePath, cacheKey }) {
  try {
    fs.writeFileSync(cachePath, `${JSON.stringify(cacheKey, null, 2)}\n`, 'utf8');
  } catch {
    // ignore cache write failure
  }
}

