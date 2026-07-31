import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, created_at, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Messages</h1>

      {!conversations || conversations.length === 0 ? (
        <p className="mt-6 text-foreground/70">No conversations yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/admin/messages/${conversation.id}`}
              className="flex items-center justify-between rounded-xl border border-black/10 bg-white/60 p-4 transition-colors hover:border-brand/40"
            >
              <p className="font-semibold text-brand-dark">
                {/* @ts-expect-error -- joined relation shape */}
                {conversation.profiles?.full_name ||
                  // @ts-expect-error -- joined relation shape
                  conversation.profiles?.email}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
