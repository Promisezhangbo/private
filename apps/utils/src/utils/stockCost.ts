/** 与 `stock` 表字段一致 */
export type StockCostInput = {
  /** 当前成本价 a → init_cost */
  init_cost: number;
  /** 当前持股数 b → init_num */
  init_num: number;
  /** 加仓成本价 c → add_cost */
  add_cost: number;
  /** 加仓股数 d → add_num */
  add_num: number;
  commission?: number;
};

export const STOCK_COST_DECIMALS = 3;
export const STOCK_COMMISSION_DECIMALS = 2;

/** 保留指定位小数，向上取整 */
export function ceilToDecimals(value: number, decimals = STOCK_COST_DECIMALS): number {
  const factor = 10 ** decimals;
  return Math.ceil(value * factor) / factor;
}

/** [(init_cost×init_num) + (add_cost×add_num + commission)] / (init_num + add_num) → end_cost */
export function calcEndCost(input: StockCostInput): number | null {
  const { init_cost: a, init_num: b, add_cost: c, add_num: d, commission = 5 } = input;
  const totalShares = b + d;
  if (totalShares <= 0) return null;
  const raw = (a * b + (c * d + commission)) / totalShares;
  return ceilToDecimals(raw);
}
