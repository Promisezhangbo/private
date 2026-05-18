-- 价格列：NUMERIC(18,3)，最多 3 位小数（与 api-server ceilStockPrice 一致）
-- 在 Prisma / Deno Deploy SQL 控制台或 psql 中执行（表名若非 stock 请替换）

ALTER TABLE stock
  ALTER COLUMN init_cost TYPE NUMERIC(18, 3) USING init_cost::numeric(18, 3),
  ALTER COLUMN add_cost TYPE NUMERIC(18, 3) USING add_cost::numeric(18, 3),
  ALTER COLUMN end_cost TYPE NUMERIC(18, 3) USING end_cost::numeric(18, 3);

-- init_num / add_num 保持 integer（股数为整数）
-- 佣金改小数见 migrate-stock-commission-to-numeric.sql
