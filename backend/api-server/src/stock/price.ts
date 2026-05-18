/** 持仓价格/佣金格式化，与前端 `apps/utils/src/utils/stockCost.ts` 规则一致。 */

export const STOCK_PRICE_DECIMALS = 3;
export const STOCK_COMMISSION_DECIMALS = 2;

export function ceilStockPrice(value: number): number {
  if (!Number.isFinite(value)) throw new Error(`Invalid price: ${value}`);
  const factor = 10 ** STOCK_PRICE_DECIMALS;
  return Math.ceil(value * factor) / factor;
}

export function formatStockCommission(value: number): number {
  if (!Number.isFinite(value)) throw new Error(`Invalid commission: ${value}`);
  const factor = 10 ** STOCK_COMMISSION_DECIMALS;
  return Math.round(value * factor) / factor;
}

/** 摊薄成本：[(a×b)+(c×d+佣金)]÷(b+d)，结果向上取整到 3 位小数。 */
export function calcEndCost(
  initCost: number,
  initNum: number,
  addCost: number,
  addNum: number,
  commission: number,
): number | null {
  const total = initNum + addNum;
  if (total <= 0) return null;
  const raw = (initCost * initNum + (addCost * addNum + commission)) / total;
  return ceilStockPrice(raw);
}
