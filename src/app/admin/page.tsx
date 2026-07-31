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
      <Link
        href="/admin/contact"
        className="mt-6 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        View Contact Messages
      </Link>
    </div>
  );
}
