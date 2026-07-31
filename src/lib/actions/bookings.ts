"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function bookSlot(formData: FormData) {
  const supabase = await createClient();
  const date = formData.get("date") as string;
  const slot_start = formData.get("slot_start") as string;
  const horse_id = (formData.get("horse_id") as string) || null;

  if (!slot_start) {
    redirect(`/portal/book?date=${date}&error=${encodeURIComponent("Please select a time slot.")}`);
  }

  const { error } = await supabase.rpc("book_slot", {
    p_slot_start: slot_start,
    p_horse_id: horse_id,
  });

  if (error) {
    redirect(`/portal/book?date=${date}&error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/portal/bookings");
  redirect("/portal/bookings");
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  revalidatePath("/portal/bookings");
  revalidatePath("/admin/bookings");
}
