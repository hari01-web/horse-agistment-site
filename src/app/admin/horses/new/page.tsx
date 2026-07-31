import { createClient } from "@/lib/supabase/server";
import { createHorse } from "@/lib/actions/horses";

export default async function NewHorsePage() {
  const supabase = await createClient();
  const { data: owners } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "owner")
    .order("email");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Add Horse</h1>

      <form
        action={createHorse}
        className="mt-6 flex max-w-lg flex-col gap-4"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Basic Info
        </h2>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Owner
          <select
            name="owner_id"
            required
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="">Select an owner</option>
            {owners?.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.full_name || owner.email}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Owner Phone
          <input
            name="owner_phone"
            placeholder="Owner's contact number"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Name
          <input
            name="name"
            required
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Breed
          <input
            name="breed"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Birth Year
          <input
            type="number"
            name="birth_year"
            placeholder="e.g. 2015"
            min="1980"
            max="2100"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Status
          <input
            name="status"
            placeholder="e.g. Healthy, In paddock 3"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Notes
          <textarea
            name="notes"
            rows={4}
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Photo
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="text-sm"
          />
        </label>

        <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand">
          Care Team
        </h2>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Vet Name
          <input
            name="vet_name"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Vet Phone
          <input
            name="vet_phone"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Farrier Name
          <input
            name="farrier_name"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Farrier Phone
          <input
            name="farrier_phone"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>

        <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand">
          Care Dates
        </h2>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Last Trim Date
          <input
            type="date"
            name="last_trim_date"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Last Dental (Teeth) Date
          <input
            type="date"
            name="last_dental_date"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Dental Provider
          <input
            name="dental_provider"
            placeholder="Who does the teeth work"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>

        <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand">
          Emergency Contact
        </h2>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Name
          <input
            name="emergency_contact_name"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Phone
          <input
            name="emergency_contact_phone"
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>

        <button
          type="submit"
          className="mt-2 w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Add Horse
        </button>
      </form>
    </div>
  );
}
