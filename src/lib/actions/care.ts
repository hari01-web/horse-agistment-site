"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCareIntervals(formData: FormData) {
  const n = (name: string, min: number) =>
    Math.max(min, Math.round(Number(formData.get(name)) || min));

  const supabase = await createClient();
  const { error } = await supabase
    .from("care_intervals")
    .update({
      trim_weeks: n("trim_weeks", 1),
      dental_months: n("dental_months", 1),
      vaccination_months: n("vaccination_months", 1),
      worming_months: n("worming_months", 1),
      warn_days: n("warn_days", 0),
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/care");
  revalidatePath("/admin");
}
