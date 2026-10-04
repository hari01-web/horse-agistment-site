"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/actions/auth";

export async function updateMyDetails(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: formData.get("full_name")?.toString().trim() || null,
      phone: formData.get("phone")?.toString().trim() || null,
    })
    .eq("id", user.id);

  if (error) return { error: "Couldn't save your details. Please try again." };

  revalidatePath("/portal/account");
  return { success: "Your details have been saved." };
}

export async function updateHorseEmergencyContact(
  horseId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_my_horse_emergency_contact", {
    p_horse_id: horseId,
    p_name: formData.get("emergency_contact_name")?.toString() ?? "",
    p_phone: formData.get("emergency_contact_phone")?.toString() ?? "",
  });

  if (error) return { error: "Couldn't save the emergency contact. Please try again." };

  revalidatePath("/portal/account");
  revalidatePath(`/portal/horses/${horseId}`);
  return { success: "Emergency contact saved." };
}
