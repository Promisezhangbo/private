-- 将价格列从 smallint 改为 NUMERIC，支持小数（建议 3～4 位小数）
-- 在 Prisma / Deno Deploy SQL 控制台或 psql 中执行（先备份；表名若非 stock 请替换）

ALTER TABLE stock
  ALTER COLUMN init_cost TYPE NUMERIC(18, 4) USING init_cost::numeric(18, 4),
  ALTER COLUMN add_cost TYPE NUMERIC(18, 4) USING add_cost::numeric(18, 4),
  ALTER COLUMN end_cost TYPE NUMERIC(18, 4) USING end_cost::numeric(18, 4);

-- init_num / add_num 保持 integer（股数为整数）
-- commission 保持 integer（佣金一般为整元）；若需小数可改为：
-- ALTER TABLE stock ALTER COLUMN commission TYPE NUMERIC(10, 2) USING commission::numeric(10, 2);
