import Link from "next/link";

// A titled block on the dashboards, optionally linking to the full page.
export function DashboardSection({
  title,
  href,
  linkLabel = "View all",
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="text-sm font-medium text-brand-dark underline-offset-2 hover:underline"
          >
            {linkLabel}
          </Link>
        )}
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

// A clickable one-line item inside a DashboardSection.
export function Row({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/70 px-4 py-3 transition-colors hover:border-brand/40"
    >
      {children}
    </Link>
  );
}
