"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPaddockLog(paddockId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("paddock_logs").insert({
    paddock_id: paddockId,
    author_id: user.id,
    type: formData.get("type"),
    notes: formData.get("notes") || null,
    performed_at: formData.get("performed_at") || new Date().toISOString().slice(0, 10),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/paddocks/${paddockId}`);
  revalidatePath("/admin/paddocks");
}

export async function updatePaddock(paddockId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("paddocks")
    .update({
      has_shelter: formData.get("has_shelter") === "on",
      notes: formData.get("notes") || null,
    })
    .eq("id", paddockId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/paddocks/${paddockId}`);
  revalidatePath("/admin/paddocks");
}
