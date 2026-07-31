"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitCareRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const horse_id = formData.get("horse_id");
  const type = formData.get("type");
  const body = formData.get("body")?.toString().trim();

  if (!horse_id || !body) return;

  const { error } = await supabase.from("care_requests").insert({
    horse_id,
    owner_id: user.id,
    type,
    body,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/portal/requests");
}

export async function markCareRequestHandled(id: string, handled: boolean) {
  const supabase = await createClient();
  await supabase.from("care_requests").update({ handled }).eq("id", id);

  revalidatePath("/admin/requests");
}
