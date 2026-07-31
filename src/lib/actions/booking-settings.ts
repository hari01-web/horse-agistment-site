"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBookingSettings(formData: FormData) {
  const supabase = await createClient();
  const days_open = formData
    .getAll("days_open")
    .map((d) => Number(d));

  const { error } = await supabase
    .from("booking_settings")
    .update({
      slot_duration_minutes: Number(formData.get("slot_duration_minutes")),
      open_time: formData.get("open_time"),
      close_time: formData.get("close_time"),
      days_open,
      capacity_per_slot: Number(formData.get("capacity_per_slot")),
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/bookings/settings");
  revalidatePath("/portal/book");
}

export async function addBlackoutDate(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("blackout_dates").insert({
    date: formData.get("date"),
    reason: formData.get("reason") || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/bookings/settings");
  revalidatePath("/portal/book");
}

export async function removeBlackoutDate(id: string) {
  const supabase = await createClient();
  await supabase.from("blackout_dates").delete().eq("id", id);

  revalidatePath("/admin/bookings/settings");
  revalidatePath("/portal/book");
}
