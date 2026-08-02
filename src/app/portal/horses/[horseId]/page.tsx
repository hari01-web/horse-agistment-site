import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PaddockMap from "@/components/shared/PaddockMap";

export default async function PortalHorseDetailPage({
  params,
}: {
  params: Promise<{ horseId: string }>;
}) {
  const { horseId } = await params;
  const supabase = await createClient();

  const [{ data: horse }, { data: updates }, { data: paddocks }] =
    await Promise.all([
      supabase.from("horses").select("*").eq("id", horseId).single(),
      supabase
        .from("horse_updates")
        .select("*")
        .eq("horse_id", horseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("paddocks")
        .select("*")
        .order("row_position")
        .order("col_position"),
    ]);

  if (!horse) notFound();

  const paddockLogs = horse.paddock_id
    ? (
        await supabase
          .from("paddock_logs")
          .select("*")
          .eq("paddock_id", horse.paddock_id)
          .order("performed_at", { ascending: false })
          .limit(5)
      ).data
    : null;

  const age = horse.birth_year
    ? new Date().getFullYear() - horse.birth_year
    : null;

  return (
    <div>
      <div className="flex items-start gap-6">
        {horse.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={horse.photo_url}
            alt={horse.name}
            className="h-32 w-32 rounded-xl object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold text-brand-dark">
            {horse.name}
          </h1>
          <p className="mt-1 text-sm text-foreground/70">
            {horse.breed || "Breed not set"}
            {age !== null ? ` · ${age} years old` : ""}
          </p>
          {horse.status && (
            <span className="mt-2 inline-block rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-dark">
              {horse.status}
            </span>
          )}
        </div>
      </div>

      {horse.notes && (
        <p className="mt-6 max-w-xl text-sm leading-6 text-foreground/80">
          {horse.notes}
        </p>
      )}

      {paddocks && paddocks.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Paddock
          </h2>
          {horse.paddock_id ? (
            <>
              <div className="mt-3">
                <PaddockMap paddocks={paddocks} highlightId={horse.paddock_id} />
              </div>
              {paddockLogs && paddockLogs.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {paddockLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border border-black/10 bg-white/60 px-4 py-2 text-sm"
                    >
                      <span className="font-semibold text-brand-dark capitalize">
                        {log.type}
                      </span>{" "}
                      — {log.performed_at}
                      {log.notes ? ` — ${log.notes}` : ""}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="mt-2 text-foreground/70">
              Not currently assigned to a paddock.
            </p>
          )}
        </section>
      )}

      <section className="mt-8 grid max-w-xl gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Care Team
          </h2>
          <dl className="mt-2 space-y-1 text-sm text-foreground/80">
            <div>
              <dt className="inline font-medium text-brand-dark">Vet: </dt>
              <dd className="inline">
                {horse.vet_name || "—"}
                {horse.vet_phone ? ` (${horse.vet_phone})` : ""}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-brand-dark">
                Farrier:{" "}
              </dt>
              <dd className="inline">
                {horse.farrier_name || "—"}
                {horse.farrier_phone ? ` (${horse.farrier_phone})` : ""}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Care Dates
          </h2>
          <dl className="mt-2 space-y-1 text-sm text-foreground/80">
            <div>
              <dt className="inline font-medium text-brand-dark">
                Last Trim:{" "}
              </dt>
              <dd className="inline">{horse.last_trim_date || "—"}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-brand-dark">
                Last Dental:{" "}
              </dt>
              <dd className="inline">
                {horse.last_dental_date || "—"}
                {horse.dental_provider ? ` (${horse.dental_provider})` : ""}
              </dd>
            </div>
          </dl>
        </div>

        {(horse.emergency_contact_name || horse.emergency_contact_phone) && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
              Emergency Contact
            </h2>
            <p className="mt-2 text-sm text-foreground/80">
              {horse.emergency_contact_name}
              {horse.emergency_contact_phone
                ? ` — ${horse.emergency_contact_phone}`
                : ""}
            </p>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Updates
        </h2>
        {!updates || updates.length === 0 ? (
          <p className="mt-3 text-foreground/70">No updates yet.</p>
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
