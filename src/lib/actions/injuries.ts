"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
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

export async function createInjuryReport(horseId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title")?.toString().trim();
  if (!title) return;

  const { data: report, error } = await supabase
    .from("injury_reports")
    .insert({ horse_id: horseId, reported_by: user.id, title })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const body = formData.get("body")?.toString().trim();
  const photo_url = await uploadPhotoIfPresent(supabase, formData.get("photo"));

  if (body || photo_url) {
    await supabase.from("injury_report_notes").insert({
      injury_report_id: report.id,
      author_id: user.id,
      body: body || null,
      photo_url,
    });
  }

  revalidatePath(`/admin/horses/${horseId}`);
  revalidatePath(`/portal/horses/${horseId}`);
}

export async function addInjuryNote(
  injuryReportId: string,
  horseId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const photo_url = await uploadPhotoIfPresent(supabase, formData.get("photo"));
  const body = formData.get("body")?.toString().trim() || null;
  const status = formData.get("status")?.toString();

  const { error } = await supabase.from("injury_report_notes").insert({
    injury_report_id: injuryReportId,
    author_id: user.id,
    body,
    photo_url,
  });

  if (error) throw new Error(error.message);

  if (status) {
    await supabase
      .from("injury_reports")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", injuryReportId);
  }

  revalidatePath(`/admin/horses/${horseId}`);
  revalidatePath(`/portal/horses/${horseId}`);
}
