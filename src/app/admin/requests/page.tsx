import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/time";
import { handleCareRequest, reopenCareRequest } from "@/lib/actions/care-requests";
import { formatMoney } from "@/lib/money";

export default async function AdminRequestsPage() {
  const supabase = await createClient();
  const [{ data: requests }, { data: prices }, { data: charges }] = await Promise.all([
    supabase
      .from("care_requests")
      .select(
        "id, type, body, handled, created_at, horses(name), profiles(full_name, email)",
      )
      .order("created_at", { ascending: false }),
    supabase.from("extra_prices").select("type, price"),
    supabase.from("charges").select("care_request_id, amount").not("care_request_id", "is", null),
  ]);
  const priceFor = (type: string) => prices?.find((p) => p.type === type)?.price;
  const chargeFor = (id: string) => charges?.find((c) => c.care_request_id === id)?.amount;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">
        Change Requests
      </h1>

      {!requests || requests.length === 0 ? (
        <p className="mt-6 text-foreground/70">No requests yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className={`rounded-xl border p-4 ${
                request.handled
                  ? "border-black/10 bg-white/40 opacity-60"
                  : "border-brand/30 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                  {request.type}
                  {/* @ts-expect-error -- joined relation shape */}
                  {request.horses?.name ? ` · ${request.horses.name}` : ""}
                </span>
                <span className="text-xs text-foreground/50">
                  {formatDateTime(request.created_at)}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-brand-dark">
                {/* @ts-expect-error -- joined relation shape */}
                {request.profiles?.full_name || request.profiles?.email}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {request.body}
              </p>
              {request.handled ? (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-foreground/60">
                    {chargeFor(request.id) != null
                      ? `Charged ${formatMoney(chargeFor(request.id))}`
                      : "No charge"}
                  </span>
                  <form
                    action={async () => {
                      "use server";
                      await reopenCareRequest(request.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="cursor-pointer font-medium text-brand-dark underline hover:text-brand"
                    >
                      Re-open
                    </button>
                  </form>
                </div>
              ) : (
                <form
                  action={handleCareRequest.bind(null, request.id)}
                  className="mt-3 flex flex-wrap items-center gap-2 text-sm"
                >
                  <label className="flex items-center gap-1 text-brand-dark">
                    Charge $
                    <input
                      type="number"
                      name="amount"
                      min={0}
                      step="0.01"
                      defaultValue={priceFor(request.type) ?? ""}
                      placeholder="0.00"
                      className="w-24 rounded-lg border border-black/15 px-2 py-1 outline-none focus:border-brand"
                    />
                  </label>
                  <button
                    type="submit"
                    className="cursor-pointer rounded-full bg-brand px-4 py-1.5 font-semibold text-white hover:bg-brand-dark"
                  >
                    Mark handled
                  </button>
                  <span className="text-xs text-foreground/50">
                    Leave blank or 0 for no charge
                  </span>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
