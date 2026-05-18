export type StockCostInput = {
  /** 当前持仓成本价 a */
  currentCost: number;
  /** 当前持股数量 b */
  currentShares: number;
  /** 加仓成本价 c */
  addCost: number;
  /** 加仓股数 d */
  addShares: number;
  /** 佣金，默认 5 元 */
  commission?: number;
};

export const STOCK_COST_DECIMALS = 3;

/** 四舍五入到指定小数位 */
export function roundToDecimals(value: number, decimals = STOCK_COST_DECIMALS): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** [(a×b) + (c×d + 佣金)] / (b + d)，结果保留三位小数（四舍五入） */
export function calcStockAvgCost(input: StockCostInput): number | null {
  const { currentCost: a, currentShares: b, addCost: c, addShares: d, commission = 5 } = input;
  const totalShares = b + d;
  if (totalShares <= 0) return null;
  const raw = (a * b + (c * d + commission)) / totalShares;
  return roundToDecimals(raw);
}
