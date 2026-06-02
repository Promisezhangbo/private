/** 中国法定节假日与调休上班日（国务院办公厅公布）。新年份发布后在此追加。 */

export interface CnHolidayCalendar {
  /** 放假日（含调休后的连续假期，如国庆 10-01～10-07）。 */
  readonly holidays: readonly string[];
  /** 调休上班日（本为周末但需上班，如国庆前周日补班）。 */
  readonly makeupWorkdays: readonly string[];
}

/** 按年索引；未收录年份仅按周一至周五判断。 */
export const CN_HOLIDAY_CALENDAR: Readonly<Record<number, CnHolidayCalendar>> = {
  2025: {
    holidays: [
      "2025-01-01",
      ...range("2025-01-28", "2025-02-04"),
      ...range("2025-04-04", "2025-04-06"),
      ...range("2025-05-01", "2025-05-05"),
      ...range("2025-05-31", "2025-06-02"),
      ...range("2025-10-01", "2025-10-08"),
    ],
    makeupWorkdays: [
      "2025-01-26",
      "2025-02-08",
      "2025-04-27",
      "2025-09-28",
      "2025-10-11",
    ],
  },
  2026: {
    holidays: [
      ...range("2026-01-01", "2026-01-03"),
      ...range("2026-02-15", "2026-02-23"),
      ...range("2026-04-04", "2026-04-06"),
      ...range("2026-05-01", "2026-05-05"),
      ...range("2026-06-19", "2026-06-21"),
      ...range("2026-09-25", "2026-09-27"),
      ...range("2026-10-01", "2026-10-07"),
    ],
    makeupWorkdays: [
      "2026-01-04",
      "2026-02-14",
      "2026-02-28",
      "2026-05-09",
      "2026-09-20",
      "2026-10-10",
    ],
  },
};

export function getSupportedCalendarYears(): readonly number[] {
  return Object.keys(CN_HOLIDAY_CALENDAR).map(Number).sort();
}

function range(start: string, end: string): string[] {
  const out: string[] = [];
  const cur = new Date(`${start}T12:00:00+08:00`);
  const last = new Date(`${end}T12:00:00+08:00`);
  while (cur <= last) {
    out.push(formatDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function formatDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const d = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${d}`;
}
