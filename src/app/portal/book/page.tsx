import { createClient } from "@/lib/supabase/server";
import { bookSlot } from "@/lib/actions/bookings";

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
  const date = dateParam || new Date().toISOString().slice(0, 10);

  const supabase = await createClient();
  const [
    { data: settings },
    { data: blackout },
    { data: existingBookings },
    { data: horses },
  ] = await Promise.all([
    supabase.from("booking_settings").select("*").eq("id", 1).single(),
    supabase.from("blackout_dates").select("*").eq("date", date).maybeSingle(),
    supabase
      .from("bookings")
      .select("slot_start")
      .eq("status", "confirmed")
      .gte("slot_start", `${date}T00:00:00.000Z`)
      .lt("slot_start", `${date}T23:59:59.999Z`),
    supabase.from("horses").select("id, name"),
  ]);

  const dayOfWeek = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  const isOpenDay = settings?.days_open?.includes(dayOfWeek);
  const isBlackedOut = !!blackout;

  const slots: { time: string; iso: string; full: boolean }[] = [];
  if (settings && isOpenDay && !isBlackedOut) {
    const openMin = toMinutes(settings.open_time);
    const closeMin = toMinutes(settings.close_time);

    const bookedCounts: Record<string, number> = {};
    existingBookings?.forEach((b) => {
      const key = new Date(b.slot_start).toISOString();
      bookedCounts[key] = (bookedCounts[key] || 0) + 1;
    });

    for (
      let m = openMin;
      m < closeMin;
      m += settings.slot_duration_minutes
    ) {
      const hh = pad(Math.floor(m / 60));
      const mm = pad(m % 60);
      const iso = new Date(`${date}T${hh}:${mm}:00.000Z`).toISOString();
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

      <form method="get" className="mt-6 flex items-end gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Date
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>
        <button
          type="submit"
          className="rounded-full border border-brand-dark/30 px-5 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-cream"
        >
          Change Date
        </button>
      </form>

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
      ) : (
        <form action={bookSlot} className="mt-6 flex flex-col gap-4">
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
            Book Selected Slot
          </button>
        </form>
      )}
    </div>
  );
}
