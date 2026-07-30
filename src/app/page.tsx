import Link from "next/link";

const HIGHLIGHTS = [
  {
    title: "Quality Agistment",
    body: "Well-maintained paddocks, reliable feeding, and daily checks so your horse is cared for like our own.",
  },
  {
    title: "Riding Bookings",
    body: "Book arena or trail riding time in a slot that suits you — no phone tag required.",
  },
  {
    title: "Stay in the Loop",
    body: "Owners get a private login to see updates, photos, and notes on their horse any time.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="bg-brand-cream/50">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Welcome Creek
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-brand-dark sm:text-5xl">
            Strathyre Park Horse Agistment
          </h1>
          <p className="max-w-xl text-lg leading-8 text-foreground/80">
            A quiet, well-run agistment property offering secure paddocks,
            attentive horse care, and riding bookings for owners and riders
            in and around Welcome Creek.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Get in Touch
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-brand-dark/30 px-6 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-white"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <div className="grid gap-10 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title}>
              <h2 className="text-lg font-semibold text-brand-dark">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
