"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { alertAdmin, preview } from "@/lib/email";

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

  const { data: horse } = await supabase
    .from("horses")
    .select("name")
    .eq("id", horse_id)
    .single();
  after(() =>
    alertAdmin(
      `${String(type).toUpperCase()} change request for ${horse?.name ?? "a horse"}`,
      [`From ${user.email}:`, preview(body)],
      "/admin/requests",
    ),
  );

  revalidatePath("/portal/requests");
}

// Mark a request handled, charging the owner the amount entered (blank or
// 0 = no charge).
export async function handleCareRequest(id: string, formData: FormData) {
  const supabase = await createClient();
  const amount = Number(formData.get("amount"));

  const { data: request, error } = await supabase
    .from("care_requests")
    .update({ handled: true })
    .eq("id", id)
    .select("owner_id, horse_id, type, body")
    .single();
  if (error) throw new Error(error.message);

  if (amount > 0) {
    const { data: price } = await supabase
      .from("extra_prices")
      .select("label")
      .eq("type", request.type)
      .single();
    const { error: chargeError } = await supabase.from("charges").upsert(
      {
        owner_id: request.owner_id,
        horse_id: request.horse_id,
        care_request_id: id,
        description: `${price?.label ?? "Extra"}: ${request.body}`.slice(0, 300),
        amount: Math.round(amount * 100) / 100,
      },
      { onConflict: "care_request_id" },
    );
    if (chargeError) throw new Error(chargeError.message);
  }

  revalidatePath("/admin/requests");
  revalidatePath("/admin/billing");
  revalidatePath("/admin");
}

// Re-open a request; any charge made for it is removed.
export async function reopenCareRequest(id: string) {
  const supabase = await createClient();
  await supabase.from("charges").delete().eq("care_request_id", id);
  await supabase.from("care_requests").update({ handled: false }).eq("id", id);

  revalidatePath("/admin/requests");
  revalidatePath("/admin/billing");
}
