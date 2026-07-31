"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markContactSubmissionHandled(
  id: string,
  handled: boolean,
) {
  const supabase = await createClient();
  await supabase
    .from("contact_submissions")
    .update({ handled })
    .eq("id", id);

  revalidatePath("/admin/contact");
}
