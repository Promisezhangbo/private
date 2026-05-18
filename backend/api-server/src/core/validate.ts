/** 路由入参校验（query / body）。 */

export function parsePositiveIntQuery(raw: string | undefined): number | "missing" | "invalid" {
  if (raw === undefined || raw === "") return "missing";
  const id = Number(raw);
  if (!Number.isFinite(id) || id < 1 || !Number.isInteger(id)) return "invalid";
  return id;
}

export function parsePositiveIntBody(v: unknown): number | "invalid" {
  const id = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(id) || id < 1 || !Number.isInteger(id)) return "invalid";
  return id;
}

export function parseNonNegNum(v: unknown): number | "invalid" {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return "invalid";
  return v;
}

export function parseNonNegInt(v: unknown): number | "invalid" {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || !Number.isInteger(v)) return "invalid";
  return v;
}
