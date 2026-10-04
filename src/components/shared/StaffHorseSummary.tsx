import FeedPlan, { type FeedPlanHorse } from "@/components/shared/FeedPlan";
import CareSchedule from "@/components/shared/CareSchedule";
import type { CareItem } from "@/lib/care";

type Horse = FeedPlanHorse & {
  name: string;
  breed: string | null;
  status: string | null;
  notes: string | null;
  photo_url: string | null;
  vet_name: string | null;
  vet_phone: string | null;
  farrier_name: string | null;
  farrier_phone: string | null;
  dental_provider: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
};

const heading = "text-sm font-semibold uppercase tracking-wide text-brand";

// Read-only horse details for staff (no owner details, no editing).
export default function StaffHorseSummary({
  horse,
  paddockName,
  careItems,
}: {
  horse: Horse;
  paddockName: string | null;
  careItems: CareItem[];
}) {
  return (
    <section className="mt-6 grid max-w-3xl gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          {horse.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={horse.photo_url}
              alt={horse.name}
              className="h-28 w-28 rounded-xl object-cover"
            />
          )}
          <div className="text-sm text-foreground/80">
            <p>{horse.breed || "Breed not set"}</p>
            <p>{paddockName ?? "No paddock assigned"}</p>
            {horse.status && (
              <span className="mt-2 inline-block rounded-full bg-brand-cream px-3 py-1 text-xs font-medium text-brand-dark">
                {horse.status}
              </span>
            )}
          </div>
        </div>
        {horse.notes && (
          <p className="text-sm leading-6 text-foreground/80">{horse.notes}</p>
        )}
        <div>
          <h2 className={heading}>Feed Plan</h2>
          <div className="mt-2">
            <FeedPlan horse={horse} />
          </div>
        </div>
        <div>
          <h2 className={heading}>Care Team</h2>
          <dl className="mt-2 space-y-1 text-sm text-foreground/80">
            <div>
              <dt className="inline font-medium text-brand-dark">Vet: </dt>
              <dd className="inline">
                {horse.vet_name || "—"}
                {horse.vet_phone ? ` (${horse.vet_phone})` : ""}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-brand-dark">Farrier: </dt>
              <dd className="inline">
                {horse.farrier_name || "—"}
                {horse.farrier_phone ? ` (${horse.farrier_phone})` : ""}
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-brand-dark">Dental: </dt>
              <dd className="inline">{horse.dental_provider || "—"}</dd>
            </div>
          </dl>
        </div>
        {(horse.emergency_contact_name || horse.emergency_contact_phone) && (
          <div>
            <h2 className={heading}>Emergency Contact</h2>
            <p className="mt-2 text-sm text-foreground/80">
              {horse.emergency_contact_name}
              {horse.emergency_contact_phone ? ` — ${horse.emergency_contact_phone}` : ""}
            </p>
          </div>
        )}
      </div>
      <div>
        <h2 className={heading}>Care Schedule</h2>
        <div className="mt-2">
          <CareSchedule items={careItems} />
        </div>
      </div>
    </section>
  );
}
