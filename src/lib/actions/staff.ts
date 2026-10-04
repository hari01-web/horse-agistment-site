"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setUserRole(userId: string, formData: FormData) {
  const role = formData.get("role")?.toString() ?? "";
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_role", {
    p_user_id: userId,
    p_role: role,
  });
  if (error) {
    redirect(`/admin/staff?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}
