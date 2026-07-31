"use client";

import { useState, useTransition } from "react";
import { submitContactForm } from "@/lib/actions/contact";

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    error?: string;
    success?: boolean;
  } | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await submitContactForm(formData);
      setResult(res);
    });
  }

  if (result?.success) {
    return (
      <p className="mt-8 rounded-lg bg-brand-cream/60 p-4 text-sm text-brand-dark">
        Thanks for reaching out — we&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="mt-8 flex flex-col gap-4">
      <input
        name="name"
        required
        placeholder="Your name"
        className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Your email"
        className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
      />
      <input
        name="phone"
        placeholder="Phone (optional)"
        className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
      />
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Your message"
        className="rounded-lg border border-black/15 px-4 py-2.5 text-sm outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {isPending ? "Sending..." : "Send Message"}
      </button>
      {result?.error && (
        <p className="text-sm text-red-600">{result.error}</p>
      )}
    </form>
  );
}
