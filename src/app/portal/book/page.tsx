import { createClient } from "@/lib/supabase/server";
import { bookSlot } from "@/lib/actions/bookings";
import BookingDatePicker from "@/components/portal/BookingDatePicker";
import { UTC_OFFSET, nextDay, todayLocal } from "@/lib/time";

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; error?: string }>;
}) {
  const { date: dateParam, error } = await searchParams;
  const date =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayLocal();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [
    { data: settings },
    { data: blackout },
    { data: existingBookings },
    { data: horses },
    { data: profile },
  ] = await Promise.all([
    supabase.from("booking_settings").select("*").eq("id", 1).single(),
    supabase.from("blackout_dates").select("*").eq("date", date).maybeSingle(),
    supabase.rpc("booked_slot_counts", {
      p_from: `${date}T00:00:00${UTC_OFFSET}`,
      p_to: `${nextDay(date)}T00:00:00${UTC_OFFSET}`,
    }),
    supabase.from("horses").select("id, name").eq("owner_id", user?.id ?? ""),
    supabase.from("profiles").select("role").eq("id", user?.id ?? "").single(),
  ]);

  // Beyond the advance-booking window, owners can request but admin approves.
  const advanceDays: number = settings?.advance_booking_days ?? 14;
  const daysAhead = Math.round(
    (Date.parse(date) - Date.parse(todayLocal())) / 86_400_000,
  );
  const needsApproval = daysAhead > advanceDays && profile?.role !== "admin";

  // Day of week of the calendar date itself (not affected by time zones).
  const dayOfWeek = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  const isOpenDay = settings?.days_open?.includes(dayOfWeek);
  const isBlackedOut = !!blackout;

  const hoursMisconfigured =
    !!settings && toMinutes(settings.open_time) >= toMinutes(settings.close_time);

  const slots: { time: string; iso: string; full: boolean }[] = [];
  if (settings && isOpenDay && !isBlackedOut) {
    const openMin = toMinutes(settings.open_time);
    const closeMin = toMinutes(settings.close_time);

    const bookedCounts: Record<string, number> = {};
    (existingBookings as { slot_start: string; taken: number }[] | null)?.forEach(
      (b) => {
        bookedCounts[new Date(b.slot_start).toISOString()] = Number(b.taken);
      },
    );

    for (
      let m = openMin;
      m < closeMin;
      m += settings.slot_duration_minutes
    ) {
      const hh = pad(Math.floor(m / 60));
      const mm = pad(m % 60);
      const start = new Date(`${date}T${hh}:${mm}:00${UTC_OFFSET}`);
      if (start < new Date()) continue;
      const iso = start.toISOString();
      const count = bookedCounts[iso] || 0;
      slots.push({
        time: `${hh}:${mm}`,
        iso,
        full: count >= settings.capacity_per_slot,
      });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">
        Book a Ride
      </h1>

      <BookingDatePicker date={date} />

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {decodeURIComponent(error)}
        </p>
      )}

      {isBlackedOut ? (
        <p className="mt-6 text-foreground/70">
          This date is unavailable for bookings.
        </p>
      ) : !isOpenDay ? (
        <p className="mt-6 text-foreground/70">
          We&apos;re closed for riding bookings on this day.
        </p>
      ) : hoursMisconfigured ? (
        <p className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Bookings aren&apos;t available right now because the opening time
          isn&apos;t before the closing time. An admin can fix this under
          Bookings → Booking Settings.
        </p>
      ) : slots.length === 0 ? (
        <p className="mt-6 text-foreground/70">
          There are no times left to book on this day. Try another date.
        </p>
      ) : (
        <form action={bookSlot} className="mt-6 flex flex-col gap-4">
          {needsApproval && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              This date is more than {advanceDays} days away, so your booking
              will be a <strong>request</strong> until Strathyre Park approves
              it. The time is held for you meanwhile, and you&apos;ll get a
              message once it&apos;s approved or declined.
            </p>
          )}
          <input type="hidden" name="date" value={date} />

          {horses && horses.length > 0 && (
            <label className="flex max-w-xs flex-col gap-1 text-sm font-medium text-brand-dark">
              Horse (optional)
              <select
                name="horse_id"
                className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
              >
                <option value="">No specific horse</option>
                {horses.map((horse) => (
                  <option key={horse.id} value={horse.id}>
                    {horse.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {slots.map((slot) => (
              <label
                key={slot.iso}
                className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium ${
                  slot.full
                    ? "cursor-not-allowed border-black/10 text-foreground/30"
                    : "border-brand/30 text-brand-dark hover:bg-brand-cream has-checked:bg-brand has-checked:text-white"
                }`}
              >
                <input
                  type="radio"
                  name="slot_start"
                  value={slot.iso}
                  disabled={slot.full}
                  required
                  className="sr-only"
                />
                {slot.time}
                {slot.full ? " (Full)" : ""}
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {needsApproval ? "Request This Time" : "Book Selected Slot"}
          </button>
        </form>
      )}
    </div>
  );
}
