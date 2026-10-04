import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedingHorse } from "@/components/shared/FeedingList";

// Horses (all for admin, own for owners via RLS) with feed plans, paddock and
// pending feed change requests, ready for <FeedingList>.
export async function loadFeedingHorses(
  supabase: SupabaseClient,
  ownerId?: string,
): Promise<FeedingHorse[]> {
  let horsesQuery = supabase
    .from("horses")
    .select("id, name, feed_morning, feed_evening, feed_extras, paddocks(name)")
    .order("name");
  if (ownerId) horsesQuery = horsesQuery.eq("owner_id", ownerId);

  const [{ data: horses }, { data: requests }] = await Promise.all([
    horsesQuery,
    supabase
      .from("care_requests")
      .select("horse_id, body")
      .eq("type", "feed")
      .eq("handled", false)
      .order("created_at"),
  ]);

  return (horses ?? []).map((horse) => {
    const paddock = horse.paddocks as unknown as { name: string } | null;
    return {
      id: horse.id,
      name: horse.name,
      feed_morning: horse.feed_morning,
      feed_evening: horse.feed_evening,
      feed_extras: horse.feed_extras,
      paddock: paddock?.name ?? null,
      pendingFeedRequests: (requests ?? [])
        .filter((r) => r.horse_id === horse.id)
        .map((r) => r.body),
    };
  });
}
