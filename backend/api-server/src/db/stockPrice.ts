/** 与前端 utils/stockCost 一致：价格保留 3 位小数 */
export const STOCK_PRICE_DECIMALS = 3;

export function roundStockPrice(value: number): number {
  if (!Number.isFinite(value)) throw new Error(`Invalid price: ${value}`);
  const factor = 10 ** STOCK_PRICE_DECIMALS;
  return Math.round(value * factor) / factor;
}
