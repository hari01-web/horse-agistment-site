import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { unreadMessageCounts } from "@/lib/dashboard";
import AreaNav from "@/components/shared/AreaNav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: horses }, unread, { data: profile }] = await Promise.all([
    supabase
      .from("horses")
      .select("id, name")
      .eq("owner_id", user?.id ?? "")
      .order("name"),
    unreadMessageCounts(supabase),
    supabase.from("profiles").select("role").eq("id", user?.id ?? "").single(),
  ]);
  const isAdmin = profile?.role === "admin";

  const items = [
    { href: "/portal", label: "Home" },
    ...(horses ?? []).map((horse) => ({
      href: `/portal/horses/${horse.id}`,
      label: horse.name,
    })),
    { href: "/portal/book", label: "Book a Ride" },
    { href: "/portal/bookings", label: "My Bookings" },
    { href: "/portal/messages", label: "Messages", badge: unread.total },
    { href: "/portal/requests", label: "Request a Change" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
      <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
        <div>
          <p className="text-sm text-foreground/60">Owner Portal</p>
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
          homeHref="/portal"
          switchLink={isAdmin ? { href: "/admin", label: "Admin" } : undefined}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
