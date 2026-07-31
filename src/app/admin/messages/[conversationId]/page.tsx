import { createClient } from "@/lib/supabase/server";
import { sendMessage } from "@/lib/actions/messages";
import { notFound } from "next/navigation";

export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: conversation }, { data: messages }] = await Promise.all([
    supabase
      .from("conversations")
      .select("id, profiles(full_name, email)")
      .eq("id", conversationId)
      .single(),
    supabase
      .from("conversation_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }),
  ]);

  if (!conversation) notFound();

  const sendMessageWithId = sendMessage.bind(
    null,
    conversationId,
    `/admin/messages/${conversationId}`,
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">
        {/* @ts-expect-error -- joined relation shape */}
        {conversation.profiles?.full_name || conversation.profiles?.email}
      </h1>

      <div className="mt-6 flex flex-col gap-3">
        {!messages || messages.length === 0 ? (
          <p className="text-foreground/70">No messages yet.</p>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === user!.id;
            return (
              <div
                key={message.id}
                className={`max-w-md rounded-xl px-4 py-3 text-sm ${
                  isMine
                    ? "ml-auto bg-brand text-white"
                    : "bg-white/70 text-foreground/80"
                }`}
              >
                <p>{message.body}</p>
                <p
                  className={`mt-1 text-xs ${
                    isMine ? "text-white/70" : "text-foreground/50"
                  }`}
                >
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            );
          })
        )}
      </div>

      <form action={sendMessageWithId} className="mt-6 flex flex-col gap-3">
        <textarea
          name="body"
          required
          rows={3}
          placeholder="Type a reply..."
          className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Send Reply
        </button>
      </form>
    </div>
  );
}
