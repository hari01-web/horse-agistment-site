import { createClient } from "@/lib/supabase/server";
import { unreadMessageCounts } from "@/lib/dashboard";
import { loadFeedingHorses } from "@/lib/feeding";
import { formatDateTime, formatLongDate } from "@/lib/time";
import StatCard from "@/components/shared/StatCard";
import FeedingList from "@/components/shared/FeedingList";
import { DashboardSection, Row } from "@/components/shared/Dashboard";
import { CARE_PILL } from "@/components/shared/CareSchedule";
import {
  CARE_DATE_COLUMNS,
  careItems,
  describeDue,
  loadCareIntervals,
  needsAttention,
} from "@/lib/care";

type Named = { full_name: string | null; email: string | null } | null;
const personName = (p: Named) => p?.full_name || p?.email || "Unknown";

export default async function AdminHome() {
  const supabase = await createClient();
  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    unread,
    { data: conversations },
    { data: requests, count: requestCount },
    { data: injuries, count: injuryCount },
    { data: bookings, count: bookingCount },
    { count: enquiryCount },
    feedingHorses,
    { data: bookingRequests },
    careIntervals,
    { data: careHorses },
  ] = await Promise.all([
    unreadMessageCounts(supabase),
    supabase.from("conversations").select("id, profiles(full_name, email)"),
    supabase
      .from("care_requests")
      .select("id, type, body, created_at, horses(name), profiles(full_name, email)", {
        count: "exact",
      })
      .eq("handled", false)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("injury_reports")
      .select("id, title, status, horse_id, horses(name)", { count: "exact" })
      .neq("status", "resolved")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select("id, slot_start, horses(name), profiles(full_name, email)", {
        count: "exact",
      })
      .eq("status", "confirmed")
      .gte("slot_start", now.toISOString())
      .lt("slot_start", weekAhead.toISOString())
      .order("slot_start")
      .limit(5),
    supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("handled", false),
    loadFeedingHorses(supabase),
    supabase
      .from("bookings")
      .select("id, slot_start, horses(name), profiles(full_name, email)")
      .eq("status", "pending")
      .order("slot_start"),
    loadCareIntervals(supabase),
    supabase.from("horses").select(`id, name, ${CARE_DATE_COLUMNS}`),
  ]);

  const careDue = (careHorses ?? [])
    .flatMap((horse) =>
      needsAttention(careItems(horse, careIntervals)).map((item) => ({
        horse,
        item,
      })),
    )
    .sort((a, b) => (a.item.daysUntilDue ?? 0) - (b.item.daysUntilDue ?? 0));

  const unreadConversations = (conversations ?? [])
    .filter((c) => unread.byConversation[c.id])
    .map((c) => ({
      id: c.id,
      name: personName(c.profiles as unknown as Named),
      unread: unread.byConversation[c.id],
    }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Admin Home</h1>
      <p className="mt-1 text-sm text-foreground/60">{formatLongDate(now)}</p>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          href="/admin/messages"
          count={unread.total}
          label="Unread messages"
          emptyLabel="No unread messages"
        />
        <StatCard
          href="/admin/requests"
          count={requestCount ?? 0}
          label="Pending change requests"
          emptyLabel="No pending requests"
        />
        <StatCard
          href="/admin/horses"
          count={injuryCount ?? 0}
          label="Open injuries"
          emptyLabel="No open injuries"
        />
        <StatCard
          href="/admin/bookings"
          count={bookingCount ?? 0}
          label="Bookings in the next 7 days"
          emptyLabel="No bookings this week"
        />
        <StatCard
          href="/admin/care"
          count={careDue.length}
          label="Care items due or overdue"
          emptyLabel="No care due"
        />
        <StatCard
          href="/admin/contact"
          count={enquiryCount ?? 0}
          label="New enquiries"
          emptyLabel="No new enquiries"
        />
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          {bookingRequests && bookingRequests.length > 0 && (
            <DashboardSection title="Booking Requests to Approve" href="/admin/bookings">
              {bookingRequests.map((b) => (
                <Row key={b.id} href="/admin/bookings">
                  <span className="font-medium text-brand-dark">
                    {formatDateTime(b.slot_start)}
                  </span>
                  <span className="text-sm text-foreground/70">
                    {personName(b.profiles as unknown as Named)}
                  </span>
                </Row>
              ))}
            </DashboardSection>
          )}

          {careDue.length > 0 && (
            <DashboardSection title="Care Due" href="/admin/care">
              {careDue.slice(0, 6).map(({ horse, item }) => (
                <Row key={horse.id + item.kind} href={`/admin/horses/${horse.id}`}>
                  <span>
                    <span className="font-medium text-brand-dark">{horse.name}</span>
                    <span className="block text-sm text-foreground/70">{item.kind}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${CARE_PILL[item.status]}`}
                  >
                    {describeDue(item)}
                  </span>
                </Row>
              ))}
            </DashboardSection>
          )}

          {unreadConversations.length > 0 && (
            <DashboardSection title="Unread Messages" href="/admin/messages">
              {unreadConversations.map((c) => (
                <Row key={c.id} href={`/admin/messages/${c.id}`}>
                  <span className="font-medium text-brand-dark">{c.name}</span>
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {c.unread} new
                  </span>
                </Row>
              ))}
            </DashboardSection>
          )}

          {requests && requests.length > 0 && (
            <DashboardSection title="Pending Change Requests" href="/admin/requests">
              {requests.map((r) => (
                <Row key={r.id} href="/admin/requests">
                  <span className="min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                      {r.type} · {(r.horses as unknown as { name: string } | null)?.name}
                    </span>
                    <span className="block truncate text-sm text-foreground/80">
                      {r.body}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-foreground/50">
                    {personName(r.profiles as unknown as Named)}
                  </span>
                </Row>
              ))}
            </DashboardSection>
          )}

          {injuries && injuries.length > 0 && (
            <DashboardSection title="Open Injuries" href="/admin/horses">
              {injuries.map((i) => (
                <Row key={i.id} href={`/admin/horses/${i.horse_id}`}>
                  <span className="min-w-0">
                    <span className="font-medium text-brand-dark">
                      {(i.horses as unknown as { name: string } | null)?.name}
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

          {bookings && bookings.length > 0 && (
            <DashboardSection title="Upcoming Bookings" href="/admin/bookings">
              {bookings.map((b) => (
                <Row key={b.id} href="/admin/bookings">
                  <span className="font-medium text-brand-dark">
                    {formatDateTime(b.slot_start)}
                  </span>
                  <span className="text-sm text-foreground/70">
                    {personName(b.profiles as unknown as Named)}
                    {(b.horses as unknown as { name: string } | null)?.name
                      ? ` · ${(b.horses as unknown as { name: string }).name}`
                      : ""}
                  </span>
                </Row>
              ))}
            </DashboardSection>
          )}
        </div>

        <DashboardSection title="Today's Feeding" href="/admin/feeding">
          <FeedingList
            horses={feedingHorses}
            horseHref={(id) => `/admin/horses/${id}`}
          />
        </DashboardSection>
      </div>
    </div>
  );
}

