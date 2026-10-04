"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AreaNavItem = { href: string; label: string; badge?: number };

export default function AreaNav({
  items,
  homeHref,
  switchLink,
}: {
  items: AreaNavItem[];
  homeHref: string;
  // Lets admins hop between the Admin area and the owner portal.
  switchLink?: { href: string; label: string };
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href ||
    (href !== homeHref && pathname.startsWith(`${href}/`));

  return (
    <nav aria-label="Section menu" className="md:w-52 md:shrink-0 print:hidden">
      <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:px-0 md:pb-0">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors md:rounded-lg ${
                  active
                    ? "bg-brand text-white"
                    : "bg-brand-cream text-brand-dark hover:bg-brand-cream/70 md:bg-transparent md:hover:bg-brand-cream"
                }`}
              >
                {item.label}
                {!!item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      active ? "bg-white text-brand-dark" : "bg-red-600 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        {switchLink && (
          <li className="shrink-0 md:mt-4 md:border-t md:border-black/10 md:pt-4">
            <Link
              href={switchLink.href}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-brand-dark/20 px-4 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-cream md:rounded-lg md:border-0"
            >
              ⇄ {switchLink.label}
            </Link>
          </li>
        )}
        <li
          className={`shrink-0 ${
            switchLink ? "" : "md:mt-4 md:border-t md:border-black/10 md:pt-4"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-brand-dark/20 px-4 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-brand-cream md:rounded-lg md:border-0"
          >
            ← Back to website
          </Link>
        </li>
      </ul>
    </nav>
  );
}
