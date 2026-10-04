import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

// Emails a horse's owner (after the response is sent).
export async function emailOwnerAboutHorse(
  supabase: SupabaseClient,
  horseId: string,
  subject: (horseName: string) => string,
  lines: (horseName: string) => string[],
) {
  const { data: horse } = await supabase
    .from("horses")
    .select("name, profiles(email)")
    .eq("id", horseId)
    .single();
  const email = (horse?.profiles as unknown as { email: string | null } | null)?.email;
  if (!horse || !email) return;
  after(() =>
    sendEmail({
      to: email,
      subject: subject(horse.name),
      lines: lines(horse.name),
      linkPath: `/portal/horses/${horseId}`,
      linkLabel: `See ${horse.name}`,
    }),
  );
}
