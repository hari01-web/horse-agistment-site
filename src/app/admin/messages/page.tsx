import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { unreadMessageCounts } from "@/lib/dashboard";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const [{ data: conversations }, unread] = await Promise.all([
    supabase
      .from("conversations")
      .select("id, created_at, profiles(full_name, email)")
      .order("created_at", { ascending: false }),
    unreadMessageCounts(supabase),
  ]);

  // Conversations with unread messages first.
  const sorted = [...(conversations ?? [])].sort(
    (a, b) =>
      (unread.byConversation[b.id] ?? 0) - (unread.byConversation[a.id] ?? 0),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Messages</h1>

      {sorted.length === 0 ? (
        <p className="mt-6 text-foreground/70">No conversations yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {sorted.map((conversation) => {
            const profile = conversation.profiles as unknown as {
              full_name: string | null;
              email: string | null;
            } | null;
            const count = unread.byConversation[conversation.id] ?? 0;
            return (
              <Link
                key={conversation.id}
                href={`/admin/messages/${conversation.id}`}
                className={`flex items-center justify-between rounded-xl border p-4 transition-colors hover:border-brand/40 ${
                  count > 0 ? "border-brand/40 bg-white" : "border-black/10 bg-white/60"
                }`}
              >
                <p className="font-semibold text-brand-dark">
                  {profile?.full_name || profile?.email}
                </p>
                {count > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {count} new
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
