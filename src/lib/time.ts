// Strathyre Park is in Welcome Creek, QLD. Queensland has no daylight saving,
// so local time is always UTC+10. All booking slots and displayed times use
// this zone regardless of where the server or viewer is.
export const TIME_ZONE = "Australia/Brisbane";
export const UTC_OFFSET = "+10:00";

// Today's date (YYYY-MM-DD) in Queensland.
export function todayLocal() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(
    new Date(),
  );
}

// The date after `date` (YYYY-MM-DD).
export function nextDay(date: string) {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

// e.g. "Sunday 4 October"
export function formatLongDate(value: string | Date = new Date()) {
  return new Date(value).toLocaleDateString("en-AU", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("en-AU", {
    timeZone: TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Calendar date (YYYY-MM-DD) of an instant, in Queensland.
export function localDateOf(value: string | Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(
    new Date(value),
  );
}

// e.g. "9:00 am"
export function formatTime(value: string | Date) {
  return new Date(value).toLocaleTimeString("en-AU", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

// Adds whole days to a YYYY-MM-DD date.
export function addDaysToDate(date: string, days: number) {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// The Monday on or before a YYYY-MM-DD date.
export function mondayOf(date: string) {
  const dow = new Date(`${date}T00:00:00.000Z`).getUTCDay(); // 0 = Sunday
  return addDaysToDate(date, dow === 0 ? -6 : 1 - dow);
}
