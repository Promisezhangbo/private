/** 中国时区工作日判断：周一至周五 + 法定节假日 + 调休上班日。 */
import { CN_HOLIDAY_CALENDAR } from "./holidays-calendar.ts";

const SHANGHAI_TZ = "Asia/Shanghai";

export interface WorkdayOptions {
  /** 额外放假日（在内置日历之上追加）。 */
  readonly extraHolidays?: ReadonlySet<string>;
  /** 额外调休上班日（在内置日历之上追加）。 */
  readonly extraWorkdays?: ReadonlySet<string>;
}

/** 解析 `YYYY-MM-DD` 列表（逗号/空白分隔）。 */
export function parseDateList(raw: string): ReadonlySet<string> {
  if (!raw.trim()) return new Set();
  return new Set(
    raw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)),
  );
}

function getShanghaiParts(date: Date): { dateKey: string; weekday: number; year: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SHANGHAI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);

  const year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const weekdayLabel = parts.find((p) => p.type === "weekday")?.value ?? "";

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    dateKey: `${year}-${month}-${day}`,
    weekday: weekdayMap[weekdayLabel] ?? -1,
    year,
  };
}

/**
 * 是否为中国时区工作日。
 *
 * 优先级：
 * 1. 调休上班日 → 是工作日（含周末补班）
 * 2. 法定节假日 → 非工作日（含国庆 7 天等）
 * 3. 周一至周五 → 工作日
 * 4. 其余 → 非工作日
 */
export function isWorkdayInShanghai(date = new Date(), options: WorkdayOptions = {}): boolean {
  const { dateKey, weekday, year } = getShanghaiParts(date);
  const calendar = CN_HOLIDAY_CALENDAR[year];

  const holidays = new Set(calendar?.holidays ?? []);
  const makeupWorkdays = new Set(calendar?.makeupWorkdays ?? []);
  for (const d of options.extraHolidays ?? []) holidays.add(d);
  for (const d of options.extraWorkdays ?? []) makeupWorkdays.add(d);

  if (makeupWorkdays.has(dateKey)) return true;
  if (holidays.has(dateKey)) return false;
  return weekday >= 1 && weekday <= 5;
}

/** 当前日期是否命中内置节假日日历。 */
export function hasHolidayCalendarForYear(year: number): boolean {
  return year in CN_HOLIDAY_CALENDAR;
}
