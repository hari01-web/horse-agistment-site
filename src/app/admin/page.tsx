import Link from "next/link";

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">
        Admin Dashboard
      </h1>
      <p className="mt-2 text-foreground/70">
        Manage horses, bookings, and messages from here soon.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/admin/horses"
          className="inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Manage Horses
        </Link>
        <Link
          href="/admin/bookings"
          className="inline-block rounded-full border border-brand-dark/30 px-6 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-cream"
        >
          Manage Bookings
        </Link>
        <Link
          href="/admin/messages"
          className="inline-block rounded-full border border-brand-dark/30 px-6 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-cream"
        >
          Owner Messages
        </Link>
        <Link
          href="/admin/contact"
          className="inline-block rounded-full border border-brand-dark/30 px-6 py-2.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-cream"
        >
          View Contact Messages
        </Link>
      </div>
    </div>
  );
}
