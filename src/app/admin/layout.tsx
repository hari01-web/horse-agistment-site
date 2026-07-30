import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
      <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-4">
        <div>
          <p className="text-sm text-foreground/60">Admin</p>
          <p className="font-medium text-brand-dark">{user?.email}</p>
        </div>
        <form action={signOut}>
          <button className="text-sm font-medium text-brand-dark underline">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
