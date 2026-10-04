"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadGalleryPhotos(formData: FormData) {
  const supabase = await createClient();
  const caption = formData.get("caption")?.toString().trim() || null;
  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("gallery").upload(path, file);
    if (error) throw new Error(error.message);
    const {
      data: { publicUrl },
    } = supabase.storage.from("gallery").getPublicUrl(path);
    const { error: rowError } = await supabase
      .from("gallery_photos")
      .insert({ path, url: publicUrl, caption });
    if (rowError) throw new Error(rowError.message);
  }

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function updateGalleryCaption(id: string, formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("gallery_photos")
    .update({ caption: formData.get("caption")?.toString().trim() || null })
    .eq("id", id);
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryPhoto(id: string, path: string) {
  const supabase = await createClient();
  await supabase.storage.from("gallery").remove([path]);
  await supabase.from("gallery_photos").delete().eq("id", id);
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}
