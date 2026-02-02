import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { DateRange, TimePeriod } from "@/lib/concept2/types";

const EST_TIMEZONE = "America/New_York";

/**
 * Get date range for the current week (Monday - Sunday) in EST
 */
export function getWeekRange(): DateRange {
  const nowUtc = new Date();
  const nowEst = toZonedTime(nowUtc, EST_TIMEZONE);

  const weekStartEst = startOfWeek(nowEst, { weekStartsOn: 1 }); // Monday 00:00 EST
  const weekStart = fromZonedTime(weekStartEst, EST_TIMEZONE);

  return {
    from: weekStart,
    to: nowUtc, // Only query up to now
  };
}

/**
 * Get date range for the current month in EST
 */
export function getMonthRange(): DateRange {
  const nowUtc = new Date();
  const nowEst = toZonedTime(nowUtc, EST_TIMEZONE);

  const monthStartEst = startOfMonth(nowEst);
  const monthStart = fromZonedTime(monthStartEst, EST_TIMEZONE);

  return {
    from: monthStart,
    to: nowUtc, // Only query up to now
  };
}

/**
 * Get date range for the current year
 */
export function getYearRange(): DateRange {
  const now = new Date();
  return {
    from: startOfYear(now),
    to: now, // Only query up to today, not end of year
  };
}

/**
 * Get date range for the last 7 days
 */
export function getLast7DaysRange(): DateRange {
  const now = new Date();
  return {
    from: subDays(now, 7),
    to: now,
  };
}

/**
 * Get date range for the last 30 days
 */
export function getLast30DaysRange(): DateRange {
  const now = new Date();
  return {
    from: subDays(now, 30),
    to: now,
  };
}

/**
 * Get custom date range
 */
export function getCustomRange(from: Date, to: Date): DateRange {
  return { from, to };
}

/**
 * Get date range based on period type
 */
export function getDateRangeForPeriod(
  period: TimePeriod,
  customFrom?: Date,
  customTo?: Date
): DateRange {
  switch (period) {
    case "week":
      return getWeekRange();
    case "month":
      return getMonthRange();
    case "year":
      return getYearRange();
    case "custom":
      if (!customFrom || !customTo) {
        throw new Error("Custom period requires from and to dates");
      }
      return getCustomRange(customFrom, customTo);
    default:
      throw new Error(`Invalid period: ${period}`);
  }
}

/**
 * Check if a date is within a date range
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  return date >= range.from && date <= range.to;
}
