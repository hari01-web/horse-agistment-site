"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/actions/auth";
import {
  updateHorseEmergencyContact,
  updateMyDetails,
} from "@/lib/actions/account";

const inputClass =
  "rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand";
const buttonClass =
  "w-fit rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60";

function Result({ state }: { state: FormState }) {
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.success) return <p className="text-sm text-green-700">{state.success}</p>;
  return null;
}

export function MyDetailsForm({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateMyDetails,
    {},
  );
  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
        Your name
        <input name="full_name" defaultValue={fullName} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
        Phone
        <input
          name="phone"
          type="tel"
          defaultValue={phone}
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving..." : "Save"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function EmergencyContactForm({
  horseId,
  horseName,
  name,
  phone,
}: {
  horseId: string;
  horseName: string;
  name: string;
  phone: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateHorseEmergencyContact.bind(null, horseId),
    {},
  );
  return (
    <form
      action={action}
      className="flex max-w-md flex-col gap-3 rounded-xl border border-black/10 bg-white/60 p-4"
    >
      <p className="font-semibold text-brand-dark">{horseName}</p>
      <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
        Emergency contact name
        <input
          name="emergency_contact_name"
          defaultValue={name}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
        Emergency contact phone
        <input
          name="emergency_contact_phone"
          type="tel"
          defaultValue={phone}
          className={inputClass}
        />
      </label>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving..." : "Save"}
      </button>
      <Result state={state} />
    </form>
  );
}
