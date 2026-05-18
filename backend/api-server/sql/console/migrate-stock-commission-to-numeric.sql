-- 佣金列：支持小数，NUMERIC(10,2) 最多 2 位小数
-- 在 Prisma / Deno Deploy SQL 控制台或 psql 中执行（表名若非 stock 请替换）

ALTER TABLE stock
  ALTER COLUMN commission TYPE NUMERIC(10, 2) USING commission::numeric(10, 2);
