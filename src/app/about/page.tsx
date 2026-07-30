export const metadata = {
  title: "About | Strathyre Park",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">
        About Us
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl">
        About Strathyre Park
      </h1>
      <div className="mt-8 space-y-5 text-base leading-7 text-foreground/80">
        <p>
          Strathyre Park is a horse agistment property based in Welcome
          Creek. We provide a safe, well-maintained space for horses to be
          paddocked, alongside riding facilities for owners and riders.
        </p>
        <p>
          Every horse in our care is checked daily, with feeding, paddock
          rotation, and general wellbeing looked after by people who know
          horses. Owners can log in at any time to see how their horse is
          doing.
        </p>
        <p className="text-sm italic text-foreground/50">
          More about our story, the property, and the team is coming soon —
          this page will be updated with more detail shortly.
        </p>
      </div>
    </div>
  );
}
