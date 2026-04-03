/** 极简 YAML frontmatter（`key: value` 单行），正文从第二个 `---` 后开始 */
export function parseMarkdownWithFrontmatter(raw: string): { fm: Record<string, string>; body: string } {
  const t = raw.trimStart();
  if (!t.startsWith('---')) {
    return { fm: {}, body: raw };
  }
  const end = t.indexOf('\n---', 3);
  if (end === -1) {
    return { fm: {}, body: raw };
  }
  const block = t.slice(3, end).trim();
  const body = t.slice(end + 4).trim();
  const fm: Record<string, string> = {};
  for (const line of block.split('\n')) {
    const m = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line);
    if (m) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      fm[m[1]] = v;
    }
  }
  return { fm, body };
}
