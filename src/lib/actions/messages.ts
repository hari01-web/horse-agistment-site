"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { alertAdmin, preview, sendEmail } from "@/lib/email";

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

  const { data: conversation } = await supabase
    .from("conversations")
    .select("owner_id, profiles(full_name, email)")
    .eq("id", conversationId)
    .single();
  const owner = conversation?.profiles as unknown as {
    full_name: string | null;
    email: string | null;
  } | null;
  after(() =>
    conversation?.owner_id === user.id
      ? alertAdmin(
          `New message from ${owner?.full_name || owner?.email || user.email}`,
          [preview(body)],
          `/admin/messages/${conversationId}`,
        )
      : sendEmail({
          to: owner?.email,
          subject: "New message from Strathyre Park",
          lines: ["You have a new message from Strathyre Park:", preview(body)],
          linkPath: "/portal/messages",
          linkLabel: "Read and reply",
        }),
  );

  revalidatePath(revalidateTargetPath);
}
