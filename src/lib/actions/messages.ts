"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getOrCreateOwnerConversation(ownerId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ owner_id: ownerId })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return created.id;
}

export async function sendMessage(
  conversationId: string,
  revalidateTargetPath: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const body = formData.get("body")?.toString().trim();
  if (!body) return;

  const { error } = await supabase.from("conversation_messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
  });

  if (error) throw new Error(error.message);

  revalidatePath(revalidateTargetPath);
}
