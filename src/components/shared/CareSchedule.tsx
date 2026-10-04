import {
  describeDue,
  formatShortDate,
  type CareItem,
  type CareStatus,
} from "@/lib/care";

export const CARE_PILL: Record<CareStatus, string> = {
  overdue: "bg-red-50 text-red-700",
  "due-soon": "bg-amber-50 text-amber-900",
  ok: "bg-green-50 text-green-800",
  unknown: "bg-black/5 text-foreground/60",
};

// Last done / next due for each kind of care on one horse.
export default function CareSchedule({ items }: { items: CareItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.kind}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/10 bg-white/60 px-4 py-2 text-sm"
        >
          <div>
            <span className="font-medium text-brand-dark">{item.kind}</span>
            <span className="block text-xs text-foreground/60">
              {item.last ? `Last: ${formatShortDate(item.last)}` : "Not recorded"}
              {item.due ? ` · Next: ${formatShortDate(item.due)}` : ""}
            </span>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${CARE_PILL[item.status]}`}
          >
            {describeDue(item)}
          </span>
        </div>
      ))}
    </div>
  );
}
