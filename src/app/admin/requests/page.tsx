import { createClient } from "@/lib/supabase/server";
import { markCareRequestHandled } from "@/lib/actions/care-requests";

export default async function AdminRequestsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("care_requests")
    .select(
      "id, type, body, handled, created_at, horses(name), profiles(full_name, email)",
    )
    .order("created_at", { ascending: false });

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
                  {new Date(request.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-brand-dark">
                {/* @ts-expect-error -- joined relation shape */}
                {request.profiles?.full_name || request.profiles?.email}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {request.body}
              </p>
              <form
                action={async () => {
                  "use server";
                  await markCareRequestHandled(request.id, !request.handled);
                }}
                className="mt-3"
              >
                <button
                  type="submit"
                  className="cursor-pointer text-sm font-medium text-brand-dark underline hover:text-brand"
                >
                  {request.handled ? "Mark as unhandled" : "Mark as handled"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
