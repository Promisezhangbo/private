const loaders = import.meta.glob('../assets/docs/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

export async function loadPostMarkdown(id: string): Promise<string | null> {
  const suffix = `/docs/${id}.md`;
  const hit = Object.entries(loaders).find(([path]) => path.replace(/\\/g, '/').endsWith(suffix));
  if (!hit) return null;
  return hit[1]();
}
