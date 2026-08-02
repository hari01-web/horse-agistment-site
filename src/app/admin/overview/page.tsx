import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const view = viewParam === "horses" ? "horses" : "owners";
  const supabase = await createClient();

  const owners =
    view === "owners"
      ? (
          await supabase
            .from("profiles")
            .select("id, full_name, email, phone, horses(name)")
            .eq("role", "owner")
            .order("email")
        ).data
      : null;

  const horses =
    view === "horses"
      ? (
          await supabase
            .from("horses")
            .select("id, name, breed, status, profiles(full_name, email), paddocks(name)")
            .order("name")
        ).data
      : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Overview</h1>

      <div className="mt-4 flex gap-2">
        <Link
          href="/admin/overview?view=owners"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            view === "owners"
              ? "bg-brand text-white"
              : "bg-brand-cream text-brand-dark hover:bg-brand-cream/70"
          }`}
        >
          Owners
        </Link>
        <Link
          href="/admin/overview?view=horses"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            view === "horses"
              ? "bg-brand text-white"
              : "bg-brand-cream text-brand-dark hover:bg-brand-cream/70"
          }`}
        >
          Horses
        </Link>
      </div>

      {view === "owners" ? (
        !owners || owners.length === 0 ? (
          <p className="mt-6 text-foreground/70">No owners yet.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wide text-brand">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Horses</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner) => (
                  <tr key={owner.id} className="border-b border-black/5">
                    <td className="py-2 pr-4 font-medium text-brand-dark">
                      {owner.full_name || "—"}
                    </td>
                    <td className="py-2 pr-4 text-foreground/80">
                      {owner.email}
                    </td>
                    <td className="py-2 pr-4 text-foreground/80">
                      {owner.phone || "—"}
                    </td>
                    <td className="py-2 pr-4 text-foreground/80">
                      {owner.horses?.length
                        ? owner.horses.map((h) => h.name).join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : !horses || horses.length === 0 ? (
        <p className="mt-6 text-foreground/70">No horses yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wide text-brand">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Breed</th>
                <th className="py-2 pr-4">Owner</th>
                <th className="py-2 pr-4">Paddock</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {horses.map((horse) => (
                <tr key={horse.id} className="border-b border-black/5">
                  <td className="py-2 pr-4">
                    <Link
                      href={`/admin/horses/${horse.id}`}
                      className="font-medium text-brand-dark underline"
                    >
                      {horse.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-foreground/80">
                    {horse.breed || "—"}
                  </td>
                  <td className="py-2 pr-4 text-foreground/80">
                    {/* @ts-expect-error -- joined relation shape */}
                    {horse.profiles?.full_name || horse.profiles?.email}
                  </td>
                  <td className="py-2 pr-4 text-foreground/80">
                    {/* @ts-expect-error -- joined relation shape */}
                    {horse.paddocks?.name || "—"}
                  </td>
                  <td className="py-2 pr-4 text-foreground/80">
                    {horse.status || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
