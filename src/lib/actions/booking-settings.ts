"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateBookingSettings(formData: FormData) {
  const open_time = String(formData.get("open_time") ?? "").slice(0, 5);
  const close_time = String(formData.get("close_time") ?? "").slice(0, 5);
  // Times are "HH:MM", so comparing the text compares the times.
  if (!open_time || !close_time || open_time >= close_time) {
    redirect(
      `/admin/bookings/settings?error=${encodeURIComponent(
        "Opening time must be before closing time. Times are Queensland time.",
      )}`,
    );
  }

  const supabase = await createClient();
  const days_open = formData
    .getAll("days_open")
    .map((d) => Number(d));

  const { error } = await supabase
    .from("booking_settings")
    .update({
      slot_duration_minutes: Number(formData.get("slot_duration_minutes")),
      open_time,
      close_time,
      days_open,
      capacity_per_slot: Number(formData.get("capacity_per_slot")),
      advance_booking_days: Math.max(
        0,
        Number(formData.get("advance_booking_days") ?? 14) || 0,
      ),
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/bookings/settings");
  revalidatePath("/portal/book");
  redirect("/admin/bookings/settings"); // clears any earlier error message
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
