import { createClient } from "@/lib/supabase/server";
import { cancelBooking, decideBookingRequest } from "@/lib/actions/bookings";
import { formatDateTime } from "@/lib/time";
import BookingStatus from "@/components/shared/BookingStatus";
import Link from "next/link";

type Booking = {
  id: string;
  slot_start: string;
  status: string;
  horses: { name: string } | null;
  profiles: { full_name: string | null; email: string | null } | null;
};

function who(booking: Booking) {
  const person = booking.profiles?.full_name || booking.profiles?.email;
  return booking.horses?.name ? `${person} · ${booking.horses.name}` : person;
}

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("id, slot_start, status, horses(name), profiles(full_name, email)")
    .order("slot_start", { ascending: false });
  const bookings = (data ?? []) as unknown as Booking[];
  const requests = bookings
    .filter((b) => b.status === "pending")
    .sort((a, b) => a.slot_start.localeCompare(b.slot_start));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-brand-dark">Bookings</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/portal/book"
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Book a Ride
          </Link>
          <Link
            href="/admin/bookings/calendar"
            className="rounded-full border border-brand-dark/30 px-5 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-cream"
          >
            Calendar
          </Link>
          <Link
            href="/admin/bookings/settings"
            className="rounded-full border border-brand-dark/30 px-5 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-cream"
          >
            Booking Settings
          </Link>
        </div>
      </div>

      {requests.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Requests Awaiting Approval
          </h2>
          <p className="mt-1 text-sm text-foreground/60">
            These are further ahead than the advance-booking limit. The owner
            gets a message when you approve or decline.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {requests.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400 bg-white p-4"
              >
                <div>
                  <p className="font-semibold text-brand-dark">
                    {formatDateTime(booking.slot_start)}
                  </p>
                  <p className="text-sm text-foreground/60">{who(booking)}</p>
                </div>
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await decideBookingRequest(booking.id, "confirmed");
                    }}
                  >
                    <button
                      type="submit"
                      className="cursor-pointer rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
                    >
                      Approve
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await decideBookingRequest(booking.id, "declined");
                    }}
                  >
                    <button
                      type="submit"
                      className="cursor-pointer rounded-full border border-brand-dark/30 px-4 py-1.5 text-sm font-semibold text-brand-dark hover:bg-brand-cream"
                    >
                      Decline
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-brand">
        All Bookings
      </h2>
      {bookings.length === 0 ? (
        <p className="mt-3 text-foreground/70">No bookings yet.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
                booking.status === "cancelled" || booking.status === "declined"
                  ? "border-black/10 bg-white/40 opacity-60"
                  : "border-brand/30 bg-white"
              }`}
            >
              <div>
                <p className="font-semibold text-brand-dark">
                  {formatDateTime(booking.slot_start)}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-foreground/60">
                  {who(booking)}
                  <BookingStatus status={booking.status} />
                </p>
              </div>
              {booking.status === "confirmed" && (
                <form
                  action={async () => {
                    "use server";
                    await cancelBooking(booking.id);
                  }}
                >
                  <button
                    type="submit"
                    className="cursor-pointer text-sm font-medium text-brand-dark underline hover:text-brand"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
