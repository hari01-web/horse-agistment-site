import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHorsesPage() {
  const supabase = await createClient();
  const { data: horses } = await supabase
    .from("horses")
    .select("id, name, breed, status, profiles(full_name, email)")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-dark">Horses</h1>
        <Link
          href="/admin/horses/new"
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Add Horse
        </Link>
      </div>

      {!horses || horses.length === 0 ? (
        <p className="mt-6 text-foreground/70">No horses added yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {horses.map((horse) => (
            <Link
              key={horse.id}
              href={`/admin/horses/${horse.id}`}
              className="flex items-center justify-between rounded-xl border border-black/10 bg-white/60 p-4 transition-colors hover:border-brand/40"
            >
              <div>
                <p className="font-semibold text-brand-dark">{horse.name}</p>
                <p className="text-sm text-foreground/60">
                  {horse.breed || "Breed not set"} · Owner:{" "}
                  {/* @ts-expect-error -- joined relation shape */}
                  {horse.profiles?.full_name || horse.profiles?.email || "Unknown"}
                </p>
              </div>
              {horse.status && (
                <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-dark">
                  {horse.status}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
