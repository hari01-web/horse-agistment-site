import type { SupabaseClient } from "@supabase/supabase-js";

export type Role = "admin" | "staff" | "owner";

// Admin-area pages staff may open: day-to-day horse care only.
const STAFF_PATHS = [
  /^\/admin$/,
  /^\/admin\/feeding$/,
  /^\/admin\/care$/,
  /^\/admin\/paddocks(\/[^/]+)?$/,
  /^\/admin\/horses$/,
  /^\/admin\/horses\/(?!new$)[^/]+$/,
];

export function staffCanOpen(path: string) {
  return STAFF_PATHS.some((re) => re.test(path));
}

export async function currentRole(
  supabase: SupabaseClient,
  userId: string | undefined,
): Promise<Role> {
  if (!userId) return "owner";
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return (data?.role as Role) ?? "owner";
}
