"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreateOwnerConversation } from "@/lib/actions/messages";
import { formatDateTime } from "@/lib/time";
import { after } from "next/server";
import { alertAdmin, sendEmail } from "@/lib/email";

export async function bookSlot(formData: FormData) {
  const supabase = await createClient();
  const date = formData.get("date") as string;
  const slot_start = formData.get("slot_start") as string;
  const horse_id = (formData.get("horse_id") as string) || null;

  if (!slot_start) {
    redirect(`/portal/book?date=${date}&error=${encodeURIComponent("Please select a time slot.")}`);
  }

  const { data: booking, error } = await supabase.rpc("book_slot", {
    p_slot_start: slot_start,
    p_horse_id: horse_id,
  });

  if (error) {
    redirect(`/portal/book?date=${date}&error=${encodeURIComponent(error.message)}`);
  }

  if (booking?.status === "pending") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    after(() =>
      alertAdmin(
        "Booking request awaiting approval",
        [`${user?.email} has requested ${formatDateTime(slot_start)}.`],
        "/admin/bookings",
      ),
    );
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

// Admin decision on a booking request beyond the advance-booking window.
// The rider is told via their Messages.
export async function decideBookingRequest(
  bookingId: string,
  decision: "confirmed" | "declined",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: booking, error } = await supabase
    .from("bookings")
    .update({ status: decision })
    .eq("id", bookingId)
    .eq("status", "pending")
    .select("rider_id, slot_start")
    .single();
  if (error) throw new Error(error.message);

  const conversationId = await getOrCreateOwnerConversation(booking.rider_id);
  const when = formatDateTime(booking.slot_start);
  await supabase.from("conversation_messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body:
      decision === "confirmed"
        ? `Your booking request for ${when} has been approved — see you then!`
        : `Sorry, we can't accommodate your booking request for ${when}. Please get in touch or choose another time.`,
  });

  const { data: rider } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", booking.rider_id)
    .single();
  after(() =>
    sendEmail({
      to: rider?.email,
      subject:
        decision === "confirmed"
          ? "Your booking request is approved"
          : "About your booking request",
      lines: [
        decision === "confirmed"
          ? `Your booking request for ${when} has been approved — see you then!`
          : `Sorry, we can't accommodate your booking request for ${when}.`,
      ],
      linkPath: "/portal/bookings",
      linkLabel: "View my bookings",
    }),
  );

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  revalidatePath("/portal/bookings");
}
