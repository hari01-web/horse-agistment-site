"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ linkFailed }: { linkFailed: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "not-found" | "rate-limited" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Accounts are invite-only: owners are added by admin in Supabase.
        shouldCreateUser: false,
        // The callback sends admins to /admin and owners to /portal.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (!error) setStatus("sent");
    else if (error.code === "otp_disabled" || /signups? not allowed/i.test(error.message))
      setStatus("not-found");
    else if (error.status === 429) setStatus("rate-limited");
    else setStatus("error");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight text-brand-dark">
        Owner &amp; Admin Login
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Enter your email and we&apos;ll send you a link to sign in — no
        password needed.
      </p>

      {status === "sent" ? (
        <div className="mt-8 rounded-lg bg-brand-cream/60 p-4 text-sm text-brand-dark">
          <p>Check your email for a sign-in link.</p>
          <p className="mt-2 text-brand-dark/70">
            Open the link on this device, in this browser — it won&apos;t work
            anywhere else.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          {linkFailed && status === "idle" && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              That sign-in link didn&apos;t work — it may have expired, already
              been used, or been opened in a different browser. Please request
              a new one below.
            </p>
          )}
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : "Send Login Link"}
          </button>
          {status === "not-found" && (
            <p className="text-sm text-red-600">
              We couldn&apos;t find an account for that email. Owner accounts
              are set up by Strathyre Park — please get in touch.
            </p>
          )}
          {status === "rate-limited" && (
            <p className="text-sm text-red-600">
              Too many sign-in emails have been requested. Please wait a while
              and try again.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
