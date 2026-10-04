"use client";

import { useActionState } from "react";
import { joinWaitingList } from "@/lib/actions/vacancies";
import type { FormState } from "@/lib/actions/auth";

const inputClass =
  "rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand";

export default function WaitingListForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    joinWaitingList,
    {},
  );

  if (state.success) {
    return (
      <p className="mt-6 rounded-lg bg-brand-cream/60 p-4 text-sm text-brand-dark">
        {state.success}
      </p>
    );
  }

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <input name="name" required placeholder="Your name" className={inputClass} />
      <input name="email" type="email" required placeholder="Your email" className={inputClass} />
      <input name="phone" type="tel" placeholder="Phone (optional)" className={inputClass} />
      <label className="flex items-center gap-3 text-sm text-brand-dark">
        Number of horses
        <input
          name="horse_count"
          type="number"
          min={1}
          max={20}
          defaultValue={1}
          className={`${inputClass} w-20`}
        />
      </label>
      <textarea
        name="message"
        rows={4}
        placeholder="Anything we should know? (e.g. when you'd like to start, any special needs)"
        className={inputClass}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Sending..." : "Join the Waiting List"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
