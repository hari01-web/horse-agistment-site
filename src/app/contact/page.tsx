import ContactForm from "@/components/site/ContactForm";

export const metadata = {
  title: "Contact | Strathyre Park",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">
        Contact
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl">
        Get in Touch
      </h1>
      <p className="mt-4 text-base leading-7 text-foreground/80">
        Have a question about agistment or riding bookings? Reach out below.
      </p>

      <dl className="mt-10 space-y-4 text-base">
        <div>
          <dt className="text-sm font-semibold text-brand-dark">Location</dt>
          <dd className="text-foreground/80">Welcome Creek</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-brand-dark">Phone</dt>
          <dd className="text-foreground/50 italic">To be confirmed</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-brand-dark">Email</dt>
          <dd className="text-foreground/50 italic">To be confirmed</dd>
        </div>
      </dl>

      <ContactForm />
    </div>
  );
}
