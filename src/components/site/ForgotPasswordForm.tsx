"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type FormState } from "@/lib/actions/auth";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    requestPasswordReset,
    {},
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight text-brand-dark">
        Set or Reset Your Password
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Enter your email and we&apos;ll send you a link to choose a new
        password. Use this the first time you log in, too.
      </p>

      {state.success ? (
        <p className="mt-8 rounded-lg bg-brand-cream/60 p-4 text-sm text-brand-dark">
          {state.success}
        </p>
      ) : (
        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-dark">
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? "Sending..." : "Send Password Link"}
          </button>
          {state.error && (
            <p aria-live="polite" className="text-sm text-red-600">
              {state.error}
            </p>
          )}
        </form>
      )}

      <Link
        href="/login"
        className="mt-6 text-sm font-medium text-brand-dark underline hover:text-brand"
      >
        Back to login
      </Link>
    </div>
  );
}
