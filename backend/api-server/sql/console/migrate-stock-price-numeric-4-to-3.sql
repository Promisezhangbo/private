-- 若已执行过 NUMERIC(18,4) 版本，用本脚本改为 NUMERIC(18,3)（写入/展示默认 3 位小数）
-- 旧整数值不变；已有 4 位小数的行会按第三位四舍五入

ALTER TABLE stock
  ALTER COLUMN init_cost TYPE NUMERIC(18, 3) USING round(init_cost::numeric, 3),
  ALTER COLUMN add_cost TYPE NUMERIC(18, 3) USING round(add_cost::numeric, 3),
  ALTER COLUMN end_cost TYPE NUMERIC(18, 3) USING round(end_cost::numeric, 3);
