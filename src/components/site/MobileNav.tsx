"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileNav({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-dark/30 text-brand-dark"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-b border-black/10 bg-background px-6 py-4 shadow-sm"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-foreground/80 hover:bg-brand-cream hover:text-brand-dark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-black/10 pt-3">
              <Link
                href="/login"
                onClick={close}
                className="block rounded-lg px-3 py-2.5 text-base font-semibold text-brand-dark hover:bg-brand-cream"
              >
                Owner Login
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
