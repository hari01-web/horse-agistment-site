"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

async function uploadPhotoIfPresent(
  supabase: SupabaseClient,
  file: FormDataEntryValue | null,
): Promise<string | null> {
  if (!file || !(file instanceof File) || file.size === 0) return null;

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("horse-photos")
    .upload(path, file);
  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("horse-photos").getPublicUrl(path);
  return publicUrl;
}

function horseFieldsFromFormData(formData: FormData) {
  const birthYearRaw = formData.get("birth_year");
  return {
    owner_id: formData.get("owner_id"),
    name: formData.get("name"),
    breed: formData.get("breed") || null,
    birth_year: birthYearRaw ? Number(birthYearRaw) : null,
    status: formData.get("status") || null,
    paddock_id: formData.get("paddock_id") || null,
    notes: formData.get("notes") || null,
    vet_name: formData.get("vet_name") || null,
    vet_phone: formData.get("vet_phone") || null,
    farrier_name: formData.get("farrier_name") || null,
    farrier_phone: formData.get("farrier_phone") || null,
    last_trim_date: formData.get("last_trim_date") || null,
    last_dental_date: formData.get("last_dental_date") || null,
    dental_provider: formData.get("dental_provider") || null,
    emergency_contact_name: formData.get("emergency_contact_name") || null,
    emergency_contact_phone: formData.get("emergency_contact_phone") || null,
  };
}

export async function createHorse(formData: FormData) {
  const supabase = await createClient();
  const photo_url = await uploadPhotoIfPresent(
    supabase,
    formData.get("photo"),
  );

  const { data, error } = await supabase
    .from("horses")
    .insert({ ...horseFieldsFromFormData(formData), photo_url })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await updateOwnerPhoneIfProvided(supabase, formData);

  revalidatePath("/admin/horses");
  redirect(`/admin/horses/${data.id}`);
}

async function updateOwnerPhoneIfProvided(
  supabase: SupabaseClient,
  formData: FormData,
) {
  const ownerPhone = formData.get("owner_phone");
  const ownerId = formData.get("owner_id");
  if (ownerPhone && ownerId) {
    await supabase
      .from("profiles")
      .update({ phone: ownerPhone })
      .eq("id", ownerId);
  }
}

export async function updateHorse(horseId: string, formData: FormData) {
  const supabase = await createClient();
  const photo_url = await uploadPhotoIfPresent(
    supabase,
    formData.get("photo"),
  );

  const update: Record<string, unknown> = {
    ...horseFieldsFromFormData(formData),
    updated_at: new Date().toISOString(),
  };
  if (photo_url) update.photo_url = photo_url;

  const { error } = await supabase
    .from("horses")
    .update(update)
    .eq("id", horseId);

  if (error) throw new Error(error.message);

  await updateOwnerPhoneIfProvided(supabase, formData);

  revalidatePath(`/admin/horses/${horseId}`);
  revalidatePath("/admin/horses");
}

export async function postHorseUpdate(horseId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const photo_url = await uploadPhotoIfPresent(
    supabase,
    formData.get("photo"),
  );

  const { error } = await supabase.from("horse_updates").insert({
    horse_id: horseId,
    author_id: user.id,
    type: formData.get("type") || "general",
    body: formData.get("body") || null,
    photo_url,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/horses/${horseId}`);
  revalidatePath(`/portal/horses/${horseId}`);
}
