import { createClient } from "@/lib/supabase/server";
import { updateHorse, postHorseUpdate } from "@/lib/actions/horses";
import { notFound } from "next/navigation";

export default async function AdminHorseDetailPage({
  params,
}: {
  params: Promise<{ horseId: string }>;
}) {
  const { horseId } = await params;
  const supabase = await createClient();

  const [{ data: horse }, { data: owners }, { data: updates }, { data: paddocks }] =
    await Promise.all([
      supabase.from("horses").select("*").eq("id", horseId).single(),
      supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .eq("role", "owner")
        .order("email"),
      supabase
        .from("horse_updates")
        .select("*")
        .eq("horse_id", horseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("paddocks")
        .select("id, name")
        .order("row_position")
        .order("col_position"),
    ]);

  if (!horse) notFound();

  const currentOwner = owners?.find((o) => o.id === horse.owner_id);
  const updateHorseWithId = updateHorse.bind(null, horseId);
  const postUpdateWithId = postHorseUpdate.bind(null, horseId);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">{horse.name}</h1>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Details
        </h2>
        <form
          action={updateHorseWithId}
          className="mt-3 flex max-w-lg flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Owner
            <select
              name="owner_id"
              required
              defaultValue={horse.owner_id}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            >
              {owners?.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.full_name || owner.email}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Owner Phone
            <input
              name="owner_phone"
              defaultValue={currentOwner?.phone ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Name
            <input
              name="name"
              required
              defaultValue={horse.name}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Breed
            <input
              name="breed"
              defaultValue={horse.breed ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Birth Year
            <input
              type="number"
              name="birth_year"
              min="1980"
              max="2100"
              defaultValue={horse.birth_year ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Status
            <input
              name="status"
              defaultValue={horse.status ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Notes
            <textarea
              name="notes"
              rows={4}
              defaultValue={horse.notes ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Paddock
            <select
              name="paddock_id"
              defaultValue={horse.paddock_id ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            >
              <option value="">Not assigned</option>
              {paddocks?.map((paddock) => (
                <option key={paddock.id} value={paddock.id}>
                  {paddock.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Replace Photo
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="text-sm"
            />
          </label>

          {horse.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={horse.photo_url}
              alt={horse.name}
              className="h-40 w-40 rounded-lg object-cover"
            />
          )}

          <h3 className="mt-2 text-sm font-semibold uppercase tracking-wide text-brand">
            Care Team
          </h3>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Vet Name
            <input
              name="vet_name"
              defaultValue={horse.vet_name ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Vet Phone
            <input
              name="vet_phone"
              defaultValue={horse.vet_phone ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Farrier Name
            <input
              name="farrier_name"
              defaultValue={horse.farrier_name ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Farrier Phone
            <input
              name="farrier_phone"
              defaultValue={horse.farrier_phone ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <h3 className="mt-2 text-sm font-semibold uppercase tracking-wide text-brand">
            Care Dates
          </h3>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Last Trim Date
            <input
              type="date"
              name="last_trim_date"
              defaultValue={horse.last_trim_date ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Last Dental (Teeth) Date
            <input
              type="date"
              name="last_dental_date"
              defaultValue={horse.last_dental_date ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Dental Provider
            <input
              name="dental_provider"
              placeholder="Who does the teeth work"
              defaultValue={horse.dental_provider ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <h3 className="mt-2 text-sm font-semibold uppercase tracking-wide text-brand">
            Emergency Contact
          </h3>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Name
            <input
              name="emergency_contact_name"
              defaultValue={horse.emergency_contact_name ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Phone
            <input
              name="emergency_contact_phone"
              defaultValue={horse.emergency_contact_phone ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>

          <button
            type="submit"
            className="mt-2 w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Save Changes
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Post an Update
        </h2>
        <form
          action={postUpdateWithId}
          className="mt-3 flex max-w-lg flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Type
            <select
              name="type"
              defaultValue="general"
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            >
              <option value="general">General</option>
              <option value="health">Health</option>
              <option value="feeding">Feeding</option>
              <option value="photo">Photo</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Note
            <textarea
              name="body"
              rows={3}
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Photo
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="text-sm"
            />
          </label>
          <button
            type="submit"
            className="w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Post Update
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Timeline
        </h2>
        {!updates || updates.length === 0 ? (
          <p className="mt-3 text-foreground/70">No updates posted yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-4">
            {updates.map((update) => (
              <div
                key={update.id}
                className="rounded-xl border border-black/10 bg-white/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                    {update.type}
                  </span>
                  <span className="text-xs text-foreground/50">
                    {new Date(update.created_at).toLocaleString()}
                  </span>
                </div>
                {update.body && (
                  <p className="mt-2 text-sm leading-6 text-foreground/80">
                    {update.body}
                  </p>
                )}
                {update.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={update.photo_url}
                    alt=""
                    className="mt-3 h-32 w-32 rounded-lg object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
