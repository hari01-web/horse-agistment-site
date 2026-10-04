"use client";

export default function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="cursor-pointer rounded-full border border-brand-dark/30 px-5 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-cream print:hidden"
    >
      {label}
    </button>
  );
}
