"use client";

import { useRouter } from "next/navigation";

// Shows the times for a new date as soon as it's picked.
export default function BookingDatePicker({ date }: { date: string }) {
  const router = useRouter();
  return (
    <label className="mt-6 flex w-fit flex-col gap-1 text-sm font-medium text-brand-dark">
      Date
      <input
        type="date"
        name="date"
        defaultValue={date}
        onChange={(e) => {
          if (e.target.value) router.push(`/portal/book?date=${e.target.value}`);
        }}
        className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}
