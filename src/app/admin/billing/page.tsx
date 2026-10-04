import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { addCharge, deleteCharge, updatePrices } from "@/lib/actions/billing";
import { formatMoney, monthLabel, monthRange, shiftMonth, validMonth } from "@/lib/money";
import { formatShortDate } from "@/lib/care";
import { todayLocal } from "@/lib/time";

type Owner = { id: string; full_name: string | null; email: string | null };
const ownerName = (o: Owner | null | undefined) => o?.full_name || o?.email || "Unknown";

const inputClass =
  "rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-brand";

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const today = todayLocal();
  const month = validMonth((await searchParams).month, today.slice(0, 7));
  const { from, to } = monthRange(month);

  const supabase = await createClient();
  const [{ data: prices }, { data: owners }, { data: charges }] = await Promise.all([
    supabase.from("extra_prices").select("type, label, price").order("type"),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "owner")
      .order("email"),
    supabase
      .from("charges")
      .select("id, owner_id, charge_date, description, amount, horses(name)")
      .gte("charge_date", from)
      .lt("charge_date", to)
      .order("charge_date"),
  ]);

  const totals = new Map<string, number>();
  for (const c of charges ?? []) {
    totals.set(c.owner_id, (totals.get(c.owner_id) ?? 0) + Number(c.amount));
  }
  const grandTotal = [...totals.values()].reduce((a, b) => a + b, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Billing</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Extras charged on top of the weekly agistment rate. Charges are added
        when you mark a change request handled, or below for one-offs.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link
          href={`/admin/billing?month=${shiftMonth(month, -1)}`}
          className="rounded-full border border-brand-dark/30 px-4 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-cream"
        >
          ← Previous
        </Link>
        <span className="px-2 font-semibold text-brand-dark">{monthLabel(month)}</span>
        <Link
          href={`/admin/billing?month=${shiftMonth(month, 1)}`}
          className="rounded-full border border-brand-dark/30 px-4 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-cream"
        >
          Next →
        </Link>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Statements · {formatMoney(grandTotal)} total
        </h2>
        {totals.size === 0 ? (
          <p className="mt-3 text-sm text-foreground/60">No extras charged this month.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {[...totals.entries()].map(([ownerId, total]) => (
              <Link
                key={ownerId}
                href={`/admin/billing/statement/${ownerId}?month=${month}`}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 px-4 py-3 hover:border-brand/40"
              >
                <span className="font-medium text-brand-dark">
                  {ownerName(owners?.find((o) => o.id === ownerId))}
                </span>
                <span className="text-sm">
                  {formatMoney(total)} <span className="text-brand-dark underline">View statement</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {charges && charges.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
            All Charges This Month
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {charges.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/10 bg-white/60 px-4 py-2 text-sm"
              >
                <span className="min-w-0">
                  <span className="text-foreground/60">{formatShortDate(c.charge_date)} · </span>
                  <span className="font-medium text-brand-dark">
                    {ownerName(owners?.find((o) => o.id === c.owner_id))}
                  </span>
                  <span className="block truncate text-foreground/70">{c.description}</span>
                </span>
                <span className="flex items-center gap-3">
                  {formatMoney(c.amount)}
                  <form
                    action={async () => {
                      "use server";
                      await deleteCharge(c.id);
                    }}
                  >
                    <button type="submit" className="cursor-pointer text-xs text-red-600 underline">
                      Remove
                    </button>
                  </form>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Add a One-off Charge
          </h2>
          <form action={addCharge} className="mt-3 flex flex-col gap-3">
            <select name="owner_id" required className={inputClass}>
              <option value="">Select an owner</option>
              {owners?.map((o) => (
                <option key={o.id} value={o.id}>
                  {ownerName(o)}
                </option>
              ))}
            </select>
            <input
              name="description"
              required
              placeholder="e.g. Held for vet visit"
              className={inputClass}
            />
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1 text-sm text-brand-dark">
                $
                <input
                  type="number"
                  name="amount"
                  required
                  min={0.01}
                  step="0.01"
                  className={`${inputClass} w-28`}
                />
              </label>
              <input type="date" name="charge_date" defaultValue={today} className={inputClass} />
            </div>
            <button
              type="submit"
              className="w-fit rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Add Charge
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Price List
          </h2>
          <p className="mt-1 text-xs text-foreground/60">
            Pre-fills the charge when you mark a request handled, and is shown
            to owners when they make a request. Leave blank for &quot;TBC&quot;.
          </p>
          <form action={updatePrices} className="mt-3 flex flex-col gap-3">
            {prices?.map((p) => (
              <label key={p.type} className="flex flex-wrap items-center gap-2 text-sm text-brand-dark">
                <span className="w-56">{p.label}</span>$
                <input
                  type="number"
                  name={`price_${p.type}`}
                  min={0}
                  step="0.01"
                  defaultValue={p.price ?? ""}
                  className={`${inputClass} w-28`}
                />
              </label>
            ))}
            <button
              type="submit"
              className="w-fit rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Save Prices
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
