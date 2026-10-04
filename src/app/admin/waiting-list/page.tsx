import { createClient } from "@/lib/supabase/server";
import { setWaitingListStatus, updateVacancyStatus } from "@/lib/actions/vacancies";
import { formatDateTime } from "@/lib/time";

const STATUS_LABELS: Record<string, string> = {
  waiting: "Waiting",
  contacted: "Contacted",
  placed: "Placed",
  removed: "Removed",
};

export default async function AdminWaitingListPage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: entries }] = await Promise.all([
    supabase.from("site_settings").select("vacancy_status, vacancy_note").eq("id", 1).single(),
    supabase.from("waiting_list").select("*").order("created_at"),
  ]);

  const active = (entries ?? []).filter((e) => e.status === "waiting" || e.status === "contacted");
  const closed = (entries ?? []).filter((e) => e.status === "placed" || e.status === "removed");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Vacancies &amp; Waiting List</h1>

      <section className="mt-6 max-w-lg rounded-xl border border-black/10 bg-white/60 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Shown on the Website
        </h2>
        <form action={updateVacancyStatus} className="mt-3 flex flex-col gap-3 text-sm">
          <select
            name="vacancy_status"
            defaultValue={settings?.vacancy_status ?? "available"}
            className="rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-brand"
          >
            <option value="available">Spaces available</option>
            <option value="limited">Limited spaces</option>
            <option value="full">Currently full</option>
          </select>
          <textarea
            name="vacancy_note"
            rows={2}
            defaultValue={settings?.vacancy_note ?? ""}
            placeholder="Optional note, e.g. 'One paddock with shelter available from November.'"
            className="rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="w-fit rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            Update Website
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Waiting List ({active.length})
        </h2>
        <p className="mt-1 text-sm text-foreground/60">Oldest first.</p>
        {active.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/60">Nobody waiting.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {active.map((entry, i) => (
              <WaitingEntry key={entry.id} entry={entry} position={i + 1} />
            ))}
          </div>
        )}
      </section>

      {closed.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-semibold text-brand-dark">
            Placed / removed ({closed.length})
          </summary>
          <div className="mt-3 flex flex-col gap-3 opacity-70">
            {closed.map((entry) => (
              <WaitingEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function WaitingEntry({
  entry,
  position,
}: {
  entry: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    horse_count: number;
    message: string | null;
    status: string;
    created_at: string;
  };
  position?: number;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-brand-dark">
            {position && <span className="mr-2 text-foreground/40">#{position}</span>}
            {entry.name}
            <span className="ml-2 text-sm font-normal text-foreground/60">
              {entry.horse_count} horse{entry.horse_count === 1 ? "" : "s"}
            </span>
          </p>
          <p className="text-sm text-foreground/70">
            <a href={`mailto:${entry.email}`} className="underline">{entry.email}</a>
            {entry.phone && (
              <>
                {" · "}
                <a href={`tel:${entry.phone}`} className="underline">{entry.phone}</a>
              </>
            )}
          </p>
          <p className="text-xs text-foreground/50">Joined {formatDateTime(entry.created_at)}</p>
        </div>
        <form action={setWaitingListStatus.bind(null, entry.id)} className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={entry.status}
            className="rounded-lg border border-black/15 px-2 py-1 text-sm outline-none focus:border-brand"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="cursor-pointer rounded-full border border-brand-dark/30 px-3 py-1 text-sm font-medium text-brand-dark hover:bg-brand-cream"
          >
            Save
          </button>
        </form>
      </div>
      {entry.message && (
        <p className="mt-2 text-sm leading-6 text-foreground/80">{entry.message}</p>
      )}
    </div>
  );
}
