import { createClient } from "@/lib/supabase/server";
import { loadFeedingHorses } from "@/lib/feeding";
import { formatLongDate } from "@/lib/time";
import FeedingList from "@/components/shared/FeedingList";

export default async function AdminFeedingPage() {
  const supabase = await createClient();
  const horses = await loadFeedingHorses(supabase);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Feeding</h1>
      <p className="mt-1 text-sm text-foreground/60">
        {formatLongDate()} · Edit a horse&apos;s plan from its page under
        Horses. Owners&apos; feed change requests are highlighted until marked
        handled in Change Requests.
      </p>
      <div className="mt-6">
        <FeedingList horses={horses} horseHref={(id) => `/admin/horses/${id}`} />
      </div>
    </div>
  );
}
