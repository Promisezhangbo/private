/** 列表分页：页码从 1 起，单页最多 100 条。 */
export function clampPagination(page: number, pageSize: number) {
  const p = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const raw = Number.isFinite(pageSize) && pageSize >= 1 ? Math.floor(pageSize) : 10;
  const ps = Math.min(100, Math.max(1, raw));
  return { page: p, pageSize: ps, offset: (p - 1) * ps };
}
