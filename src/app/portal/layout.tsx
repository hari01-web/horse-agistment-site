import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import HorseSwitcher from "@/components/portal/HorseSwitcher";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: horses } = await supabase
    .from("horses")
    .select("id, name")
    .eq("owner_id", user?.id ?? "")
    .order("name");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
      <div className="mb-8 flex items-center justify-between border-b border-black/10 pb-4">
        <div>
          <p className="text-sm text-foreground/60">Owner Portal</p>
          <p className="font-medium text-brand-dark">{user?.email}</p>
        </div>
        <form action={signOut}>
          <button className="text-sm font-medium text-brand-dark underline">
            Sign out
          </button>
        </form>
      </div>
      <HorseSwitcher horses={horses ?? []} />
      {children}
    </div>
  );
}
