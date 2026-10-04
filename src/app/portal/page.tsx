import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { unreadMessageCounts } from "@/lib/dashboard";
import { loadFeedingHorses } from "@/lib/feeding";
import { formatDateTime, formatLongDate } from "@/lib/time";
import StatCard from "@/components/shared/StatCard";
import FeedPlan from "@/components/shared/FeedPlan";
import { DashboardSection, Row } from "@/components/shared/Dashboard";

export default async function PortalHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? "";
  const now = new Date();

  // Row Level Security limits requests, injuries and bookings to this owner.
  const [
    { data: horses },
    unread,
    { data: requests, count: requestCount },
    { data: injuries, count: injuryCount },
    { data: bookings, count: bookingCount },
    feedingHorses,
  ] = await Promise.all([
    supabase
      .from("horses")
      .select("id, name, breed, status, photo_url, paddocks(name)")
      .eq("owner_id", userId)
      .order("name"),
    unreadMessageCounts(supabase),
    supabase
      .from("care_requests")
      .select("id, type, body, horses(name)", { count: "exact" })
      .eq("handled", false)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("injury_reports")
      .select("id, title, status, horse_id, horses(name)", { count: "exact" })
      .neq("status", "resolved")
      .order("updated_at", { ascending: false }),
    supabase
      .from("bookings")
      .select("id, slot_start, horses(name)", { count: "exact" })
      .eq("status", "confirmed")
      .gte("slot_start", now.toISOString())
      .order("slot_start")
      .limit(5),
    loadFeedingHorses(supabase, userId),
  ]);

  const horseName = (h: unknown) => (h as { name: string } | null)?.name;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Welcome back</h1>
      <p className="mt-1 text-sm text-foreground/60">{formatLongDate(now)}</p>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          href="/portal/messages"
          count={unread.total}
          label="Unread messages"
          emptyLabel="No unread messages"
        />
        <StatCard
          href="/portal/requests"
          count={requestCount ?? 0}
          label="Requests in progress"
          emptyLabel="No pending requests"
        />
        <StatCard
          href={injuries?.[0] ? `/portal/horses/${injuries[0].horse_id}` : "/portal"}
          count={injuryCount ?? 0}
          label="Open injuries"
          emptyLabel="No open injuries"
        />
        <StatCard
          href="/portal/bookings"
          count={bookingCount ?? 0}
          label="Upcoming bookings"
          emptyLabel="No upcoming bookings"
        />
      </section>

      {!horses || horses.length === 0 ? (
        <p className="mt-8 text-foreground/70">
          No horses linked to your account yet. Get in touch if this looks
          wrong.
        </p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <DashboardSection title="Your Horses">
              {horses.map((horse) => (
                <Link
                  key={horse.id}
                  href={`/portal/horses/${horse.id}`}
                  className="flex items-center gap-4 rounded-xl border border-black/10 bg-white/70 p-4 transition-colors hover:border-brand/40"
                >
                  {horse.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={horse.photo_url}
                      alt={horse.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-brand-dark">{horse.name}</p>
                    <p className="text-sm text-foreground/60">
                      {horseName(horse.paddocks) ?? "No paddock assigned"}
                      {horse.status ? ` · ${horse.status}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </DashboardSection>

            {injuries && injuries.length > 0 && (
              <DashboardSection title="Open Injuries">
                {injuries.map((i) => (
                  <Row key={i.id} href={`/portal/horses/${i.horse_id}`}>
                    <span className="min-w-0">
                      <span className="font-medium text-brand-dark">
                        {horseName(i.horses)}
                      </span>
                      <span className="block truncate text-sm text-foreground/80">
                        {i.title}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium capitalize text-red-700">
                      {i.status}
                    </span>
                  </Row>
                ))}
              </DashboardSection>
            )}

            {requests && requests.length > 0 && (
              <DashboardSection title="Requests in Progress" href="/portal/requests">
                {requests.map((r) => (
                  <Row key={r.id} href="/portal/requests">
                    <span className="min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                        {r.type} · {horseName(r.horses)}
                      </span>
                      <span className="block truncate text-sm text-foreground/80">
                        {r.body}
                      </span>
                    </span>
                  </Row>
                ))}
              </DashboardSection>
            )}

            {bookings && bookings.length > 0 && (
              <DashboardSection title="Upcoming Bookings" href="/portal/bookings">
                {bookings.map((b) => (
                  <Row key={b.id} href="/portal/bookings">
                    <span className="font-medium text-brand-dark">
                      {formatDateTime(b.slot_start)}
                    </span>
                    {horseName(b.horses) && (
                      <span className="text-sm text-foreground/70">
                        {horseName(b.horses)}
                      </span>
                    )}
                  </Row>
                ))}
              </DashboardSection>
            )}
          </div>

          <DashboardSection title="Feeding Plan" href="/portal/requests" linkLabel="Request a change">
            {feedingHorses.map((horse) => (
              <div
                key={horse.id}
                className="rounded-xl border border-black/10 bg-white/70 p-4"
              >
                {feedingHorses.length > 1 && (
                  <p className="mb-2 font-semibold text-brand-dark">{horse.name}</p>
                )}
                <FeedPlan horse={horse} />
                {horse.pendingFeedRequests.map((body, i) => (
                  <p
                    key={i}
                    className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"
                  >
                    <span className="font-semibold">Change requested:</span> {body}
                  </p>
                ))}
              </div>
            ))}
          </DashboardSection>
        </div>
      )}
    </div>
  );
}
