import { createClient } from "@/lib/supabase/server";
import { loadFeedingHorses } from "@/lib/feeding";
import { formatLongDate } from "@/lib/time";
import FeedingList from "@/components/shared/FeedingList";
import PrintButton from "@/components/shared/PrintButton";

export default async function AdminFeedingPage() {
  const supabase = await createClient();
  const horses = await loadFeedingHorses(supabase);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-brand-dark">
          Feeding <span className="hidden print:inline">— Strathyre Park</span>
        </h1>
        <PrintButton label="Print Feed Chart" />
      </div>
      <p className="mt-1 text-sm text-foreground/60">
        {formatLongDate()}
        <span className="print:hidden">
          {" "}· Edit a horse&apos;s plan from its page under Horses.
          Owners&apos; feed change requests are highlighted until marked
          handled in Change Requests.
        </span>
      </p>
      <div className="mt-6 print:mt-3">
        <FeedingList horses={horses} horseHref={(id) => `/admin/horses/${id}`} />
      </div>
    </div>
  );
}
