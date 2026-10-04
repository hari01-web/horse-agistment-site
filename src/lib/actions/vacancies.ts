"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/actions/auth";

export async function joinWaitingList(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  if (!name || !email) return { error: "Please enter your name and email." };

  const supabase = await createClient();
  const { error } = await supabase.from("waiting_list").insert({
    name,
    email,
    phone: formData.get("phone")?.toString().trim() || null,
    horse_count: Math.min(20, Math.max(1, Number(formData.get("horse_count")) || 1)),
    message: formData.get("message")?.toString().trim() || null,
  });
  if (error) return { error: "Something went wrong. Please try again." };

  revalidatePath("/admin/waiting-list");
  return { success: "Thanks — you're on the waiting list. We'll be in touch when a space opens up." };
}

export async function updateVacancyStatus(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      vacancy_status: formData.get("vacancy_status"),
      vacancy_note: formData.get("vacancy_note")?.toString().trim() || null,
    })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/vacancies");
  revalidatePath("/admin/waiting-list");
}

export async function setWaitingListStatus(id: string, formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("waiting_list")
    .update({ status: formData.get("status") })
    .eq("id", id);
  revalidatePath("/admin/waiting-list");
}
