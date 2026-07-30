import Link from "next/link";

export const metadata = {
  title: "Services | Strathyre Park",
};

const SERVICES = [
  {
    name: "Horse Agistment",
    description:
      "Secure paddock space with daily checks, feeding, and paddock rotation. Owners get a private login to view updates on their horse.",
  },
  {
    name: "Riding Bookings",
    description:
      "Book a time slot for arena or trail riding. Availability is managed online — no need to call ahead.",
  },
  {
    name: "Owner Updates",
    description:
      "Health notes, feeding logs, and photos posted by our team, visible any time through the owner portal.",
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">
        Services
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl">
        What We Offer
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/80">
        Pricing and package details are being finalised — get in touch for
        current rates and availability.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {SERVICES.map((service) => (
          <div
            key={service.name}
            className="rounded-2xl border border-black/10 bg-white/60 p-6"
          >
            <h2 className="text-lg font-semibold text-brand-dark">
              {service.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground/70">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Link
          href="/contact"
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Ask About Availability
        </Link>
      </div>
    </div>
  );
}
