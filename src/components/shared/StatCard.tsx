import Link from "next/link";

// A notification tile on the dashboards: big number, label, links through.
export default function StatCard({
  href,
  count,
  label,
  emptyLabel,
}: {
  href: string;
  count: number;
  label: string;
  emptyLabel: string;
}) {
  const hasItems = count > 0;
  return (
    <Link
      href={href}
      className={`flex flex-col rounded-xl border p-4 transition-colors ${
        hasItems
          ? "border-brand/40 bg-white hover:border-brand"
          : "border-black/10 bg-white/50 hover:border-brand/40"
      }`}
    >
      <span
        className={`text-3xl font-semibold ${
          hasItems ? "text-brand-dark" : "text-foreground/30"
        }`}
      >
        {count}
      </span>
      <span
        className={`mt-1 text-sm ${
          hasItems ? "font-medium text-brand-dark" : "text-foreground/50"
        }`}
      >
        {hasItems ? label : emptyLabel}
      </span>
    </Link>
  );
}
