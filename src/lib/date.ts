/**
 * Date helpers.
 *
 * Everything in the database is an ISO 'YYYY-MM-DD' string, compared as text.
 * These helpers stay in UTC so a step completed at 23:50 and a streak computed
 * a moment later agree about which day it is.
 */

export type IsoDate = string;

export function todayIso(now: Date = new Date()): IsoDate {
  return now.toISOString().slice(0, 10);
}

export function nowIso(now: Date = new Date()): string {
  return now.toISOString();
}

export function parseIso(date: IsoDate): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = parseIso(date);
  d.setUTCDate(d.getUTCDate() + days);
  return todayIso(d);
}

/** Whole days from `from` to `to`. Negative when `to` is in the past. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const ms = parseIso(to).getTime() - parseIso(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function daysUntil(date: IsoDate | null, from: IsoDate = todayIso()): number | null {
  if (!date) return null;
  return daysBetween(from, date);
}

/** 1-based day number within a 365-day journey that began on `startDate`. */
export function dayIndex(startDate: IsoDate, on: IsoDate = todayIso()): number {
  return Math.max(1, daysBetween(startDate, on) + 1);
}

export function formatDate(date: IsoDate | null, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!date) return "No deadline";
  return parseIso(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
    ...opts,
  });
}

export function formatDateLong(date: IsoDate | null): string {
  if (!date) return "No deadline";
  return parseIso(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function weekdayLabel(date: IsoDate): string {
  return parseIso(date).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

/** The last `count` days ending today, oldest first. */
export function lastNDays(count: number, end: IsoDate = todayIso()): IsoDate[] {
  return Array.from({ length: count }, (_, i) => addDays(end, -(count - 1 - i)));
}

/** Urgency band for a deadline — drives the red / amber / green dots. */
export type Urgency = "closed" | "critical" | "soon" | "comfortable";

export function urgency(daysLeft: number | null): Urgency {
  if (daysLeft === null) return "comfortable";
  if (daysLeft < 0) return "closed";
  if (daysLeft <= 7) return "critical";
  if (daysLeft <= 30) return "soon";
  return "comfortable";
}

export function deadlineLabel(daysLeft: number | null): string {
  if (daysLeft === null) return "Rolling";
  if (daysLeft < 0) return "Closed";
  if (daysLeft === 0) return "Closes today";
  if (daysLeft === 1) return "1 day left";
  return `${daysLeft} days left`;
}

export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
