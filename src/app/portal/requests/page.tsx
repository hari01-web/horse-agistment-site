import { createClient } from "@/lib/supabase/server";
import CareRequestForm from "@/components/portal/CareRequestForm";

export default async function PortalRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: horses }, { data: requests }] = await Promise.all([
    supabase.from("horses").select("id, name").eq("owner_id", user!.id),
    supabase
      .from("care_requests")
      .select("id, type, body, handled, created_at, horses(name)")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">
        Request a Change
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-foreground/70">
        Your weekly agistment rate covers your horse&apos;s regular plan.
        Last-minute changes — a different feed, putting a rug on or off, or
        anything else outside the normal routine — are billed as an{" "}
        <strong>extra charge on top of your weekly rate</strong> (amounts
        TBC). Use the sections below to let us know what&apos;s needed.
      </p>

      {!horses || horses.length === 0 ? (
        <p className="mt-6 text-foreground/70">
          No horses linked to your account yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <CareRequestForm
            type="feed"
            label="Feed"
            extraCost="TBC per change"
            placeholder="e.g. extra biscuit of hay tonight"
            horses={horses}
          />
          <CareRequestForm
            type="rug"
            label="Rug"
            extraCost="TBC per change"
            placeholder="e.g. put the heavy rug on tonight"
            horses={horses}
          />
          <CareRequestForm
            type="other"
            label="Other"
            extraCost="TBC — holding for farrier/vet/dental also billed as an extra"
            placeholder="e.g. hold for farrier visit Thursday"
            horses={horses}
          />
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Your Requests
        </h2>
        {!requests || requests.length === 0 ? (
          <p className="mt-3 text-foreground/70">No requests yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
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
                    {new Date(request.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/80">
                  {request.body}
                </p>
                <p className="mt-2 text-xs font-medium text-foreground/50">
                  {request.handled ? "Actioned" : "Pending"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
