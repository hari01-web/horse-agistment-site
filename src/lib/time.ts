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

export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("en-AU", {
    timeZone: TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  });
}
