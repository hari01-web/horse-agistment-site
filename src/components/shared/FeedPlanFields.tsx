import type { FeedPlanHorse } from "@/components/shared/FeedPlan";

const fieldClass =
  "rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand";

// Feed plan inputs for the admin add/edit horse forms.
export default function FeedPlanFields({
  horse,
}: {
  horse?: Partial<FeedPlanHorse>;
}) {
  return (
    <>
      <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
        Morning Feed
        <textarea
          name="feed_morning"
          rows={2}
          placeholder="e.g. 2 biscuits lucerne hay, 1 scoop pellets"
          defaultValue={horse?.feed_morning ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
        Evening Feed
        <textarea
          name="feed_evening"
          rows={2}
          placeholder="e.g. 3 biscuits meadow hay"
          defaultValue={horse?.feed_evening ?? ""}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
        Extras / Supplements
        <textarea
          name="feed_extras"
          rows={2}
          placeholder="e.g. Joint supplement with morning feed"
          defaultValue={horse?.feed_extras ?? ""}
          className={fieldClass}
        />
      </label>
    </>
  );
}
