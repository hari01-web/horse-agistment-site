import Link from "next/link";
import FeedPlan, { type FeedPlanHorse } from "@/components/shared/FeedPlan";

export type FeedingHorse = FeedPlanHorse & {
  id: string;
  name: string;
  paddock: string | null;
  pendingFeedRequests: string[];
};

// Every horse's regular feed plan, with any not-yet-handled feed change
// requests highlighted so they aren't missed at feed time.
export default function FeedingList({
  horses,
  horseHref,
}: {
  horses: FeedingHorse[];
  horseHref: (id: string) => string;
}) {
  if (horses.length === 0) {
    return <p className="text-sm text-foreground/60">No horses yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3 print:grid print:grid-cols-2 print:gap-2">
      {horses.map((horse) => (
        <div
          key={horse.id}
          className={`break-inside-avoid rounded-xl border bg-white/70 p-4 print:p-2 ${
            horse.pendingFeedRequests.length > 0
              ? "border-amber-400"
              : "border-black/10"
          }`}
        >
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <Link
              href={horseHref(horse.id)}
              className="font-semibold text-brand-dark underline-offset-2 hover:underline"
            >
              {horse.name}
            </Link>
            {horse.paddock && (
              <span className="text-xs text-foreground/60">{horse.paddock}</span>
            )}
          </div>
          <FeedPlan horse={horse} />
          {horse.pendingFeedRequests.map((body, i) => (
            <p
              key={i}
              className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"
            >
              <span className="font-semibold">Change requested:</span> {body}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
