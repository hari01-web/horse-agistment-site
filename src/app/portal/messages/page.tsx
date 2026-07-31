import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateOwnerConversation,
  sendMessage,
} from "@/lib/actions/messages";

export default async function PortalMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const conversationId = await getOrCreateOwnerConversation(user!.id);

  const { data: messages } = await supabase
    .from("conversation_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const sendMessageWithId = sendMessage.bind(
    null,
    conversationId,
    "/portal/messages",
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Messages</h1>

      <div className="mt-6 flex flex-col gap-3">
        {!messages || messages.length === 0 ? (
          <p className="text-foreground/70">
            No messages yet — send one below to get in touch with us.
          </p>
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

      <form
        action={sendMessageWithId}
        className="mt-6 flex flex-col gap-3"
      >
        <textarea
          name="body"
          required
          rows={3}
          placeholder="Type a message..."
          className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Send
        </button>
      </form>
    </div>
  );
}
