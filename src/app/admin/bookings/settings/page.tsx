import { createClient } from "@/lib/supabase/server";
import {
  updateBookingSettings,
  addBlackoutDate,
  removeBlackoutDate,
} from "@/lib/actions/booking-settings";

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export default async function BookingSettingsPage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: blackoutDates }] = await Promise.all([
    supabase.from("booking_settings").select("*").eq("id", 1).single(),
    supabase.from("blackout_dates").select("*").order("date"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">
        Booking Settings
      </h1>

      <section className="mt-6">
        <form
          action={updateBookingSettings}
          className="flex max-w-lg flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Slot Duration (minutes)
            <input
              type="number"
              name="slot_duration_minutes"
              defaultValue={settings?.slot_duration_minutes}
              min={15}
              step={15}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Opening Time
            <input
              type="time"
              name="open_time"
              defaultValue={settings?.open_time}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Closing Time
            <input
              type="time"
              name="close_time"
              defaultValue={settings?.close_time}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Capacity per Slot
            <input
              type="number"
              name="capacity_per_slot"
              defaultValue={settings?.capacity_per_slot}
              min={1}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <fieldset className="flex flex-col gap-2 text-sm font-medium text-brand-dark">
            Open Days
            <div className="flex flex-wrap gap-3">
              {DAYS.map((day) => (
                <label
                  key={day.value}
                  className="flex items-center gap-1.5 font-normal"
                >
                  <input
                    type="checkbox"
                    name="days_open"
                    value={day.value}
                    defaultChecked={settings?.days_open?.includes(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Save Settings
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Blackout Dates
        </h2>
        <form
          action={addBlackoutDate}
          className="mt-3 flex flex-wrap items-end gap-3"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Date
            <input
              type="date"
              name="date"
              required
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Reason (optional)
            <input
              name="reason"
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <button
            type="submit"
            className="rounded-full border border-brand-dark/30 px-5 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-cream"
          >
            Add Blackout Date
          </button>
        </form>

        {!blackoutDates || blackoutDates.length === 0 ? (
          <p className="mt-4 text-foreground/70">No blackout dates set.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {blackoutDates.map((bd) => (
              <div
                key={bd.id}
                className="flex items-center justify-between rounded-lg border border-black/10 bg-white/60 px-4 py-2 text-sm"
              >
                <span>
                  {bd.date}
                  {bd.reason ? ` — ${bd.reason}` : ""}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await removeBlackoutDate(bd.id);
                  }}
                >
                  <button
                    type="submit"
                    className="cursor-pointer font-medium text-brand-dark underline hover:text-brand"
                  >
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
