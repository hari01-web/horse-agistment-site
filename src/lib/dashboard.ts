import type { SupabaseClient } from "@supabase/supabase-js";

// Total unread messages for the signed-in user (see unread_message_counts()).
export async function unreadMessageCounts(supabase: SupabaseClient) {
  const { data } = await supabase.rpc("unread_message_counts");
  const byConversation: Record<string, number> = {};
  let total = 0;
  for (const row of (data ?? []) as { conversation_id: string; unread: number }[]) {
    byConversation[row.conversation_id] = Number(row.unread);
    total += Number(row.unread);
  }
  return { total, byConversation };
}

// Marks the conversation read; returns true if anything was unread (so the
// page can refresh the menu badge).
export async function markConversationRead(
  supabase: SupabaseClient,
  conversationId: string,
) {
  const { byConversation } = await unreadMessageCounts(supabase);
  if (!byConversation[conversationId]) return false;
  await supabase.rpc("mark_conversation_read", {
    p_conversation_id: conversationId,
  });
  return true;
}
