import { submitCareRequest } from "@/lib/actions/care-requests";

export default function CareRequestForm({
  type,
  label,
  extraCost,
  placeholder,
  horses,
}: {
  type: "feed" | "rug" | "other";
  label: string;
  extraCost: string;
  placeholder: string;
  horses: { id: string; name: string }[];
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/60 p-5">
      <h3 className="font-semibold text-brand-dark">{label}</h3>
      <p className="mt-1 text-xs font-medium text-red-600">
        Extra charge applies: {extraCost}
      </p>
      <form action={submitCareRequest} className="mt-3 flex flex-col gap-3">
        <input type="hidden" name="type" value={type} />

        {horses.length > 1 && (
          <select
            name="horse_id"
            required
            className="rounded-lg border border-black/15 px-4 py-2 text-sm outline-none focus:border-brand"
          >
            {horses.map((horse) => (
              <option key={horse.id} value={horse.id}>
                {horse.name}
              </option>
            ))}
          </select>
        )}
        {horses.length === 1 && (
          <input type="hidden" name="horse_id" value={horses[0].id} />
        )}

        <textarea
          name="body"
          required
          rows={2}
          placeholder={placeholder}
          className="rounded-lg border border-black/15 px-4 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="w-fit rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
