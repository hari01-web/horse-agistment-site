import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  CARE_DATE_COLUMNS,
  careItems,
  loadCareIntervals,
  needsAttention,
} from "@/lib/care";
import { updateCareIntervals } from "@/lib/actions/care";
import CareSchedule from "@/components/shared/CareSchedule";

const inputClass =
  "w-24 rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand";

export default async function AdminCarePage() {
  const supabase = await createClient();
  const [intervals, { data: horses }] = await Promise.all([
    loadCareIntervals(supabase),
    supabase.from("horses").select(`id, name, ${CARE_DATE_COLUMNS}`).order("name"),
  ]);

  // Horses needing attention first (most overdue at the top).
  const rows = (horses ?? [])
    .map((horse) => {
      const items = careItems(horse, intervals);
      const urgent = needsAttention(items);
      return { horse, items, urgency: urgent[0]?.daysUntilDue ?? Infinity };
    })
    .sort((a, b) => a.urgency - b.urgency);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Care Schedule</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Next farrier, dental, vaccination and worming dates for every horse.
        Update the &quot;last done&quot; dates on each horse&apos;s page.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {rows.map(({ horse, items }) => (
          <section key={horse.id} className="rounded-xl border border-black/10 bg-white/50 p-4">
            <Link
              href={`/admin/horses/${horse.id}`}
              className="font-semibold text-brand-dark underline-offset-2 hover:underline"
            >
              {horse.name}
            </Link>
            <div className="mt-3">
              <CareSchedule items={items} />
            </div>
          </section>
        ))}
        {rows.length === 0 && <p className="text-foreground/70">No horses yet.</p>}
      </div>

      <section className="mt-10 max-w-lg">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Reminder Settings
        </h2>
        <form action={updateCareIntervals} className="mt-3 flex flex-col gap-3 text-sm">
          {[
            ["trim_weeks", "Farrier / trim every", intervals.trim_weeks, "weeks"],
            ["dental_months", "Dental every", intervals.dental_months, "months"],
            ["vaccination_months", "Vaccination every", intervals.vaccination_months, "months"],
            ["worming_months", "Worming every", intervals.worming_months, "months"],
            ["warn_days", "Warn me", intervals.warn_days, "days before it's due"],
          ].map(([name, label, value, unit]) => (
            <label key={name} className="flex flex-wrap items-center gap-2 text-brand-dark">
              <span className="w-40 font-medium">{label}</span>
              <input
                type="number"
                name={String(name)}
                defaultValue={Number(value)}
                min={name === "warn_days" ? 0 : 1}
                className={inputClass}
              />
              <span className="text-foreground/70">{unit}</span>
            </label>
          ))}
          <button
            type="submit"
            className="mt-2 w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Save Settings
          </button>
        </form>
      </section>
    </div>
  );
}
