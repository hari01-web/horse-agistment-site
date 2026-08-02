import { createClient } from "@/lib/supabase/server";
import { addPaddockLog, updatePaddock } from "@/lib/actions/paddocks";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AdminPaddockDetailPage({
  params,
}: {
  params: Promise<{ paddockId: string }>;
}) {
  const { paddockId } = await params;
  const supabase = await createClient();

  const [{ data: paddock }, { data: logs }, { data: horses }] =
    await Promise.all([
      supabase.from("paddocks").select("*").eq("id", paddockId).single(),
      supabase
        .from("paddock_logs")
        .select("*")
        .eq("paddock_id", paddockId)
        .order("performed_at", { ascending: false }),
      supabase.from("horses").select("id, name").eq("paddock_id", paddockId),
    ]);

  if (!paddock) notFound();

  const addLogWithId = addPaddockLog.bind(null, paddockId);
  const updatePaddockWithId = updatePaddock.bind(null, paddockId);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">
        {paddock.name}
      </h1>

      <section className="mt-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Horses Currently Here
        </h2>
        {!horses || horses.length === 0 ? (
          <p className="mt-2 text-foreground/70">No horses assigned.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {horses.map((horse) => (
              <li
                key={horse.id}
                className="rounded-full bg-brand-cream px-3 py-1 text-sm text-brand-dark"
              >
                {horse.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 max-w-md">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Paddock Details
        </h2>
        <form
          action={updatePaddockWithId}
          className="mt-3 flex flex-col gap-3"
        >
          <label className="flex items-center gap-2 text-sm font-medium text-brand-dark">
            <input
              type="checkbox"
              name="has_shelter"
              defaultChecked={paddock.has_shelter}
            />
            Has shelter
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Notes
            <textarea
              name="notes"
              rows={3}
              defaultValue={paddock.notes ?? ""}
              className="rounded-lg border border-black/15 px-4 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <button
            type="submit"
            className="w-fit rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Save
          </button>
        </form>
      </section>

      <section className="mt-8 max-w-md">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Log Maintenance
        </h2>
        <form action={addLogWithId} className="mt-3 flex flex-col gap-3">
          <select
            name="type"
            className="rounded-lg border border-black/15 px-4 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="irrigation">Irrigation</option>
            <option value="slashing">Slashing</option>
            <option value="other">Other</option>
          </select>
          <input
            type="date"
            name="performed_at"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="rounded-lg border border-black/15 px-4 py-2 text-sm outline-none focus:border-brand"
          />
          <textarea
            name="notes"
            rows={2}
            placeholder="Notes (optional)"
            className="rounded-lg border border-black/15 px-4 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="w-fit rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Add Log
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          History
        </h2>
        {!logs || logs.length === 0 ? (
          <p className="mt-2 text-foreground/70">No logs yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {logs.map((log) => (
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
      </section>

      <Link
        href="/admin/paddocks"
        className="mt-8 inline-block text-sm font-medium text-brand-dark underline"
      >
        Back to Paddock Map
      </Link>
    </div>
  );
}
