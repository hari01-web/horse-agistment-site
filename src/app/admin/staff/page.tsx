import { createClient } from "@/lib/supabase/server";
import { setUserRole } from "@/lib/actions/staff";

const ROLE_HELP: Record<string, string> = {
  owner: "Sees only their own horses, bookings and messages.",
  staff:
    "Sees horses, feeding, care schedule and paddocks; can post updates, injury notes and paddock logs. Can't see owners' details, messages, bookings, billing or settings.",
  admin: "Full access to everything.",
};

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    { data: people },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .order("role")
      .order("email"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Staff &amp; Roles</h1>
      <div className="mt-2 max-w-2xl space-y-2 text-sm text-foreground/70">
        <p>
          <strong>To add someone:</strong> invite them in Supabase
          (Authentication → Users → Add user → Send invitation). Once
          they&apos;ve accepted, they appear below as an owner — change their
          role here if they&apos;re staff.
        </p>
        <ul className="list-inside list-disc">
          {Object.entries(ROLE_HELP).map(([role, help]) => (
            <li key={role}>
              <strong className="capitalize">{role}:</strong> {help}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <p className="mt-4 max-w-2xl rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {(people ?? []).map((person) => {
          const isMe = person.id === user?.id;
          return (
            <div
              key={person.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/60 p-4"
            >
              <div>
                <p className="font-semibold text-brand-dark">
                  {person.full_name || person.email}
                  {isMe && <span className="ml-2 text-xs font-normal text-foreground/50">(you)</span>}
                </p>
                {person.full_name && (
                  <p className="text-sm text-foreground/60">{person.email}</p>
                )}
              </div>
              {isMe ? (
                <span className="text-sm capitalize text-foreground/60">{person.role}</span>
              ) : (
                <form
                  action={setUserRole.bind(null, person.id)}
                  className="flex items-center gap-2"
                >
                  <select
                    name="role"
                    defaultValue={person.role}
                    className="rounded-lg border border-black/15 px-3 py-1.5 text-sm outline-none focus:border-brand"
                  >
                    <option value="owner">Owner</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    className="cursor-pointer rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    Save
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
