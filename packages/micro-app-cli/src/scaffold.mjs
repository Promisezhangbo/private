import fs from 'node:fs';
import path from 'node:path';
import { APPS_DIR, TEMPLATES_DIR } from './paths.mjs';

/** 复制到子应用时改回标准文件名（.tpl 避免 IDE 对占位符做类型检查） */
function destFileName(templateName) {
  if (templateName === 'tsconfig.scaffold.json') return 'tsconfig.json';
  if (templateName.endsWith('.tpl')) return templateName.slice(0, -'.tpl'.length);
  return templateName;
}

function renderTemplate(content, vars) {
  let out = content;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`__${key}__`).join(String(value));
  }
  return out;
}

function copyTemplateTree(srcDir, destDir, vars) {
  if (!fs.existsSync(srcDir)) throw new Error(`模板目录不存在: ${srcDir}`);
  fs.mkdirSync(destDir, { recursive: true });
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, ent.name);
    const dest = path.join(destDir, destFileName(ent.name));
    if (ent.isDirectory()) {
      copyTemplateTree(src, dest, vars);
    } else {
      const raw = fs.readFileSync(src, 'utf8');
      fs.writeFileSync(dest, renderTemplate(raw, vars), 'utf8');
    }
  }
}

/** 从 apps/skill 复制 favicon（二进制） */
export function copyFavicon(appDir) {
  const src = path.join(APPS_DIR, 'skill', 'public', 'favicon.ico');
  const destDir = path.join(appDir, 'public');
  const dest = path.join(destDir, 'favicon.ico');
  if (!fs.existsSync(src)) {
    fs.mkdirSync(destDir, { recursive: true });
    return;
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
}

export function scaffoldMicroApp({ name, port, menuLabel, description }) {
  const appDir = path.join(APPS_DIR, name);
  if (fs.existsSync(appDir)) throw new Error(`apps/${name} 已存在`);

  const title = menuLabel || name;
  const vars = {
    NAME: name,
    PORT: port,
    MENU_LABEL: title,
    DESCRIPTION: description,
    SEO_TITLE: `${title} | 张博`,
    SEO_DESC: description,
    SEO_KEYWORDS: `zhangbo, 张博, ${name}, 微前端`,
  };

  copyTemplateTree(TEMPLATES_DIR, appDir, vars);
  copyFavicon(appDir);
  console.log(`[micro-app-cli] 已创建 apps/${name}（端口 ${port}）`);
}
