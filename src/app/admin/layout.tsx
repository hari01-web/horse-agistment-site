import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { unreadMessageCounts } from "@/lib/dashboard";
import AreaNav from "@/components/shared/AreaNav";
import { currentRole, staffCanOpen } from "@/lib/roles";
import {
  CARE_DATE_COLUMNS,
  careItems,
  loadCareIntervals,
  needsAttention,
} from "@/lib/care";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    unread,
    { count: pendingRequests },
    { count: newEnquiries },
    { count: bookingRequests },
    careIntervals,
    { data: careHorses },
    { count: newWaiting },
  ] = await Promise.all([
    supabase.auth.getUser(),
    unreadMessageCounts(supabase),
    supabase
      .from("care_requests")
      .select("id", { count: "exact", head: true })
      .eq("handled", false),
    supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("handled", false),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    loadCareIntervals(supabase),
    supabase.from("horses").select(CARE_DATE_COLUMNS),
    supabase
      .from("waiting_list")
      .select("id", { count: "exact", head: true })
      .eq("status", "waiting"),
  ]);
  const role = await currentRole(supabase, user?.id);
  const careDue = (careHorses ?? []).reduce(
    (n, horse) => n + needsAttention(careItems(horse, careIntervals)).length,
    0,
  );

  const allItems = [
    { href: "/admin", label: "Home" },
    { href: "/admin/horses", label: "Horses" },
    { href: "/admin/feeding", label: "Feeding" },
    { href: "/admin/care", label: "Care Schedule", badge: careDue },
    { href: "/admin/overview", label: "Owners" },
    { href: "/admin/bookings", label: "Bookings", badge: bookingRequests ?? 0 },
    { href: "/admin/messages", label: "Messages", badge: unread.total },
    { href: "/admin/requests", label: "Change Requests", badge: pendingRequests ?? 0 },
    { href: "/admin/billing", label: "Billing" },
    { href: "/admin/paddocks", label: "Paddocks" },
    { href: "/admin/waiting-list", label: "Waiting List", badge: newWaiting ?? 0 },
    { href: "/admin/contact", label: "Enquiries", badge: newEnquiries ?? 0 },
    { href: "/admin/gallery", label: "Gallery" },
    { href: "/admin/staff", label: "Staff & Roles" },
  ];
  const items =
    role === "staff" ? allItems.filter((item) => staffCanOpen(item.href)) : allItems;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
      <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4 print:hidden">
        <div>
          <p className="text-sm text-foreground/60">
            {role === "staff" ? "Staff" : "Admin"}
          </p>
          <p className="font-medium text-brand-dark">{user?.email}</p>
        </div>
        <form action={signOut}>
          <button className="text-sm font-medium text-brand-dark underline">
            Sign out
          </button>
        </form>
      </div>
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <AreaNav
          items={items}
          homeHref="/admin"
          switchLink={
            role === "admin" ? { href: "/portal", label: "Owner view" } : undefined
          }
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
