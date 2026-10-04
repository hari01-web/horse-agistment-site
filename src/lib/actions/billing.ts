"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePrices(formData: FormData) {
  const supabase = await createClient();
  for (const type of ["feed", "rug", "other"]) {
    const raw = formData.get(`price_${type}`)?.toString().trim();
    const price = raw ? Math.max(0, Math.round(Number(raw) * 100) / 100) : null;
    const { error } = await supabase
      .from("extra_prices")
      .update({ price })
      .eq("type", type);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/billing");
  revalidatePath("/admin/requests");
  revalidatePath("/portal/requests");
}

export async function addCharge(formData: FormData) {
  const supabase = await createClient();
  const amount = Number(formData.get("amount"));
  const owner_id = formData.get("owner_id")?.toString();
  const description = formData.get("description")?.toString().trim();
  if (!owner_id || !description || !(amount > 0)) return;

  const { error } = await supabase.from("charges").insert({
    owner_id,
    description,
    amount: Math.round(amount * 100) / 100,
    charge_date: formData.get("charge_date")?.toString() || undefined,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/billing");
}

export async function deleteCharge(id: string) {
  const supabase = await createClient();
  await supabase.from("charges").delete().eq("id", id);
  revalidatePath("/admin/billing");
}
