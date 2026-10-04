const STYLES: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-green-50 text-green-800" },
  pending: { label: "Awaiting approval", className: "bg-amber-50 text-amber-900" },
  declined: { label: "Declined", className: "bg-red-50 text-red-700" },
  cancelled: { label: "Cancelled", className: "bg-black/5 text-foreground/60" },
};

export default function BookingStatus({ status }: { status: string }) {
  const style = STYLES[status] ?? { label: status, className: "bg-black/5" };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}
