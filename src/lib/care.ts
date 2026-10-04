import type { SupabaseClient } from "@supabase/supabase-js";
import { todayLocal } from "@/lib/time";

export type CareIntervals = {
  trim_weeks: number;
  dental_months: number;
  vaccination_months: number;
  worming_months: number;
  warn_days: number;
};

export const DEFAULT_INTERVALS: CareIntervals = {
  trim_weeks: 6,
  dental_months: 12,
  vaccination_months: 12,
  worming_months: 3,
  warn_days: 7,
};

export type CareDates = {
  last_trim_date: string | null;
  last_dental_date: string | null;
  last_vaccination_date: string | null;
  last_worming_date: string | null;
};

export type CareStatus = "overdue" | "due-soon" | "ok" | "unknown";

export type CareItem = {
  kind: "Farrier / trim" | "Dental" | "Vaccination" | "Worming";
  last: string | null;
  due: string | null;
  daysUntilDue: number | null;
  status: CareStatus;
};

// Dates are plain YYYY-MM-DD calendar dates; do the maths in UTC so time
// zones can't shift them by a day.
function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonths(date: string, months: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export function careItems(
  horse: CareDates,
  intervals: CareIntervals,
  today = todayLocal(),
): CareItem[] {
  const make = (
    kind: CareItem["kind"],
    last: string | null,
    due: (last: string) => string,
  ): CareItem => {
    if (!last) return { kind, last, due: null, daysUntilDue: null, status: "unknown" };
    const dueDate = due(last);
    const daysUntilDue = daysBetween(today, dueDate);
    const status: CareStatus =
      daysUntilDue < 0 ? "overdue" : daysUntilDue <= intervals.warn_days ? "due-soon" : "ok";
    return { kind, last, due: dueDate, daysUntilDue, status };
  };

  return [
    make("Farrier / trim", horse.last_trim_date, (d) => addDays(d, intervals.trim_weeks * 7)),
    make("Dental", horse.last_dental_date, (d) => addMonths(d, intervals.dental_months)),
    make("Vaccination", horse.last_vaccination_date, (d) =>
      addMonths(d, intervals.vaccination_months),
    ),
    make("Worming", horse.last_worming_date, (d) => addMonths(d, intervals.worming_months)),
  ];
}

export function describeDue(item: CareItem) {
  if (item.daysUntilDue === null) return "No date recorded";
  if (item.daysUntilDue < 0) {
    const n = -item.daysUntilDue;
    return `Overdue by ${n} day${n === 1 ? "" : "s"}`;
  }
  if (item.daysUntilDue === 0) return "Due today";
  return `Due in ${item.daysUntilDue} day${item.daysUntilDue === 1 ? "" : "s"}`;
}

export function formatShortDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-AU", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function loadCareIntervals(
  supabase: SupabaseClient,
): Promise<CareIntervals> {
  const { data } = await supabase
    .from("care_intervals")
    .select("trim_weeks, dental_months, vaccination_months, worming_months, warn_days")
    .eq("id", 1)
    .maybeSingle();
  return data ?? DEFAULT_INTERVALS;
}

export const CARE_DATE_COLUMNS =
  "last_trim_date, last_dental_date, last_vaccination_date, last_worming_date";

// Overdue first, then soonest due.
export function needsAttention(items: CareItem[]) {
  return items
    .filter((i) => i.status === "overdue" || i.status === "due-soon")
    .sort((a, b) => (a.daysUntilDue ?? 0) - (b.daysUntilDue ?? 0));
}
