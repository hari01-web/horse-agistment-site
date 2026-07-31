import { createClient } from "@/lib/supabase/server";
import { markContactSubmissionHandled } from "@/lib/actions/contact-admin";

export default async function AdminContactPage() {
  const supabase = await createClient();
  const { data: submissions } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">
        Contact Messages
      </h1>

      {!submissions || submissions.length === 0 ? (
        <p className="mt-4 text-foreground/70">No messages yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className={`rounded-xl border p-5 ${
                submission.handled
                  ? "border-black/10 bg-white/40 opacity-60"
                  : "border-brand/30 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-brand-dark">
                    {submission.name}
                  </p>
                  <p className="text-sm text-foreground/70">
                    {submission.email}
                    {submission.phone ? ` · ${submission.phone}` : ""}
                  </p>
                </div>
                <p className="whitespace-nowrap text-xs text-foreground/50">
                  {new Date(submission.created_at).toLocaleString()}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground/80">
                {submission.message}
              </p>
              <form
                action={async () => {
                  "use server";
                  await markContactSubmissionHandled(
                    submission.id,
                    !submission.handled,
                  );
                }}
                className="mt-4"
              >
                <button
                  type="submit"
                  className="cursor-pointer text-sm font-medium text-brand-dark underline hover:text-brand"
                >
                  {submission.handled
                    ? "Mark as unhandled"
                    : "Mark as handled"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
