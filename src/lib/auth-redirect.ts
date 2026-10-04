import type { SupabaseClient } from "@supabase/supabase-js";
import { currentRole } from "@/lib/roles";

// Where to send someone right after they sign in: admins and staff to the
// admin area, owners to their portal.
export async function homeForUser(supabase: SupabaseClient, userId: string) {
  const role = await currentRole(supabase, userId);
  return role === "owner" ? "/portal" : "/admin";
}
