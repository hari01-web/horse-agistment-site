import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PortalHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: horses } = await supabase
    .from("horses")
    .select("id, name, breed, status, photo_url")
    .eq("owner_id", user?.id ?? "");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">
        Your Horses
      </h1>

      {!horses || horses.length === 0 ? (
        <p className="mt-4 text-foreground/70">
          No horses linked to your account yet. Get in touch if this looks
          wrong.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {horses.map((horse) => (
            <Link
              key={horse.id}
              href={`/portal/horses/${horse.id}`}
              className="flex items-center gap-4 rounded-xl border border-black/10 bg-white/60 p-4 transition-colors hover:border-brand/40"
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
                  {horse.breed || "Breed not set"}
                  {horse.status ? ` · ${horse.status}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
