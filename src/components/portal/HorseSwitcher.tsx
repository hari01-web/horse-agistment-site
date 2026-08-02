"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HorseSwitcher({
  horses,
}: {
  horses: { id: string; name: string }[];
}) {
  const pathname = usePathname();

  if (horses.length <= 1) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-brand">
        Your Horses
      </span>
      {horses.map((horse) => {
        const href = `/portal/horses/${horse.id}`;
        const isActive = pathname === href;
        return (
          <Link
            key={horse.id}
            href={href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-brand text-white"
                : "bg-brand-cream text-brand-dark hover:bg-brand-cream/70"
            }`}
          >
            {horse.name}
          </Link>
        );
      })}
    </div>
  );
}
