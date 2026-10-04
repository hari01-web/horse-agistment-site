import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  UTC_OFFSET,
  addDaysToDate,
  formatTime,
  localDateOf,
  mondayOf,
  todayLocal,
} from "@/lib/time";
import BookingStatus from "@/components/shared/BookingStatus";

type Booking = {
  id: string;
  slot_start: string;
  status: string;
  horses: { name: string } | null;
  profiles: { full_name: string | null; email: string | null } | null;
};

export default async function BookingsCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const today = todayLocal();
  const monday = mondayOf(week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : today);
  const days = Array.from({ length: 7 }, (_, i) => addDaysToDate(monday, i));

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, slot_start, status, horses(name), profiles(full_name, email)")
    .in("status", ["confirmed", "pending"])
    .gte("slot_start", `${monday}T00:00:00${UTC_OFFSET}`)
    .lt("slot_start", `${addDaysToDate(monday, 7)}T00:00:00${UTC_OFFSET}`)
    .order("slot_start");
  const bookings = (data ?? []) as unknown as Booking[];

  const label = (date: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${date}T00:00:00Z`).toLocaleDateString("en-AU", {
      timeZone: "UTC",
      ...opts,
    });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-brand-dark">Bookings Calendar</h1>
        <Link
          href="/admin/bookings"
          className="text-sm font-medium text-brand-dark underline"
        >
          List view
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/admin/bookings/calendar?week=${addDaysToDate(monday, -7)}`}
          className="rounded-full border border-brand-dark/30 px-4 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-cream"
        >
          ← Previous week
        </Link>
        <Link
          href="/admin/bookings/calendar"
          className="rounded-full border border-brand-dark/30 px-4 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-cream"
        >
          This week
        </Link>
        <Link
          href={`/admin/bookings/calendar?week=${addDaysToDate(monday, 7)}`}
          className="rounded-full border border-brand-dark/30 px-4 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-cream"
        >
          Next week →
        </Link>
        <span className="text-sm text-foreground/60">
          {label(monday, { day: "numeric", month: "short" })} –{" "}
          {label(days[6], { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-7">
        {days.map((day) => {
          const dayBookings = bookings.filter((b) => localDateOf(b.slot_start) === day);
          const isToday = day === today;
          return (
            <section
              key={day}
              className={`rounded-xl border p-3 ${
                isToday ? "border-brand bg-white" : "border-black/10 bg-white/50"
              }`}
            >
              <h2 className="text-sm font-semibold text-brand-dark">
                {label(day, { weekday: "short" })}{" "}
                <span className="font-normal text-foreground/60">
                  {label(day, { day: "numeric", month: "short" })}
                </span>
                {isToday && (
                  <span className="ml-1 text-xs font-medium text-brand">Today</span>
                )}
              </h2>
              {dayBookings.length === 0 ? (
                <p className="mt-2 text-xs text-foreground/40">No bookings</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {dayBookings.map((b) => (
                    <li
                      key={b.id}
                      className={`rounded-lg px-2 py-1.5 text-xs ${
                        b.status === "pending" ? "bg-amber-50" : "bg-brand-cream"
                      }`}
                    >
                      <span className="font-semibold text-brand-dark">
                        {formatTime(b.slot_start)}
                      </span>
                      <span className="block text-foreground/80">
                        {b.profiles?.full_name || b.profiles?.email}
                      </span>
                      {b.horses?.name && (
                        <span className="block text-foreground/60">{b.horses.name}</span>
                      )}
                      {b.status === "pending" && (
                        <span className="mt-1 inline-block">
                          <BookingStatus status="pending" />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
