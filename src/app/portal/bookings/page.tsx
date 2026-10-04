import { createClient } from "@/lib/supabase/server";
import { cancelBooking } from "@/lib/actions/bookings";
import { formatDateTime } from "@/lib/time";
import BookingStatus from "@/components/shared/BookingStatus";
import Link from "next/link";

export default async function PortalBookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, slot_start, slot_end, status, horses(name)")
    .order("slot_start", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-dark">
          Your Bookings
        </h1>
        <Link
          href="/portal/book"
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Book a Ride
        </Link>
      </div>

      {!bookings || bookings.length === 0 ? (
        <p className="mt-6 text-foreground/70">No bookings yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`flex items-center justify-between rounded-xl border p-4 ${
                booking.status === "cancelled" || booking.status === "declined"
                  ? "border-black/10 bg-white/40 opacity-60"
                  : booking.status === "pending"
                    ? "border-amber-400 bg-white"
                    : "border-brand/30 bg-white"
              }`}
            >
              <div>
                <p className="font-semibold text-brand-dark">
                  {formatDateTime(booking.slot_start)}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-foreground/60">
                  {/* @ts-expect-error -- joined relation shape */}
                  {booking.horses?.name
                    ? // @ts-expect-error -- joined relation shape
                      `Horse: ${booking.horses.name}`
                    : "No horse specified"}
                  <BookingStatus status={booking.status} />
                </p>
              </div>
              {(booking.status === "confirmed" || booking.status === "pending") && (
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
