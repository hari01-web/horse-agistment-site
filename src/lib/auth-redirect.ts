import type { SupabaseClient } from "@supabase/supabase-js";

// Where to send someone right after they sign in: admins to the dashboard,
// owners to their portal.
export async function homeForUser(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return profile?.role === "admin" ? "/admin" : "/portal";
}
