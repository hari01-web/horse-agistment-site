"use client";

import { useActionState } from "react";
import { setPassword, type FormState } from "@/lib/actions/auth";

const inputClass =
  "rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand";

export default function SetPasswordForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    setPassword,
    {},
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight text-brand-dark">
        Choose Your Password
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        For {email}. Use at least 8 characters — a few random words works
        well.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        {/* Lets password managers save the password against the right email. */}
        <input
          type="email"
          name="username"
          value={email}
          autoComplete="username"
          readOnly
          hidden
        />
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          New password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
          Confirm new password
          <input
            type="password"
            name="confirm"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save Password"}
        </button>
        {state.error && (
          <p aria-live="polite" className="text-sm text-red-600">
            {state.error}
          </p>
        )}
      </form>
    </div>
  );
}
