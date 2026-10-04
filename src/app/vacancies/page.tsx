import { createClient } from "@/lib/supabase/server";
import WaitingListForm from "@/components/site/WaitingListForm";

export const metadata = {
  title: "Vacancies | Strathyre Park",
};

const STATUS = {
  available: {
    title: "Spaces available",
    body: "We currently have agistment spaces available. Join the list below and we'll be in touch to arrange a visit.",
    className: "border-green-300 bg-green-50 text-green-900",
  },
  limited: {
    title: "Limited spaces",
    body: "We have only a few spaces left. Join the list below and we'll contact you as soon as possible.",
    className: "border-amber-300 bg-amber-50 text-amber-900",
  },
  full: {
    title: "Currently full",
    body: "We're full at the moment, but spaces do come up. Join the waiting list and we'll contact you when one opens.",
    className: "border-black/15 bg-white text-brand-dark",
  },
} as const;

export default async function VacanciesPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("vacancy_status, vacancy_note")
    .eq("id", 1)
    .maybeSingle();
  const status =
    STATUS[(settings?.vacancy_status as keyof typeof STATUS) ?? "available"] ??
    STATUS.available;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">
        Vacancies
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl">
        Agistment Availability
      </h1>

      <div className={`mt-8 rounded-2xl border p-6 ${status.className}`}>
        <p className="text-lg font-semibold">{status.title}</p>
        <p className="mt-2 text-sm leading-6">{status.body}</p>
        {settings?.vacancy_note && (
          <p className="mt-3 text-sm font-medium leading-6">{settings.vacancy_note}</p>
        )}
      </div>

      <h2 className="mt-12 text-xl font-semibold text-brand-dark">
        Join the Waiting List
      </h2>
      <WaitingListForm />
    </div>
  );
}
