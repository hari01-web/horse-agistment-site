export type FeedPlanHorse = {
  feed_morning: string | null;
  feed_evening: string | null;
  feed_extras: string | null;
};

export function hasFeedPlan(horse: FeedPlanHorse) {
  return !!(horse.feed_morning || horse.feed_evening || horse.feed_extras);
}

// Morning / evening / extras for one horse.
export default function FeedPlan({ horse }: { horse: FeedPlanHorse }) {
  if (!hasFeedPlan(horse)) {
    return <p className="text-sm text-foreground/50">No feed plan set yet.</p>;
  }
  return (
    <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
      {horse.feed_morning && (
        <>
          <dt className="font-medium text-brand-dark">Morning</dt>
          <dd className="text-foreground/80">{horse.feed_morning}</dd>
        </>
      )}
      {horse.feed_evening && (
        <>
          <dt className="font-medium text-brand-dark">Evening</dt>
          <dd className="text-foreground/80">{horse.feed_evening}</dd>
        </>
      )}
      {horse.feed_extras && (
        <>
          <dt className="font-medium text-brand-dark">Extras</dt>
          <dd className="text-foreground/80">{horse.feed_extras}</dd>
        </>
      )}
    </dl>
  );
}
