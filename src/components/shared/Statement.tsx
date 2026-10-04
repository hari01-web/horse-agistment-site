import Image from "next/image";
import { formatMoney, monthLabel } from "@/lib/money";
import { formatShortDate } from "@/lib/care";

export type StatementCharge = {
  id: string;
  charge_date: string;
  description: string;
  amount: number | string;
  horses: { name: string } | null;
};

// A monthly statement of extras for one owner; prints cleanly.
export default function Statement({
  ownerName,
  ownerEmail,
  month,
  charges,
}: {
  ownerName: string;
  ownerEmail: string | null;
  month: string;
  charges: StatementCharge[];
}) {
  const total = charges.reduce((sum, c) => sum + Number(c.amount), 0);
  return (
    <article className="max-w-2xl rounded-xl border border-black/10 bg-white p-6 print:border-0 print:p-0">
      <header className="flex items-start justify-between gap-4 border-b border-black/10 pb-4">
        <div>
          <p className="text-lg font-semibold text-brand-dark">Strathyre Park</p>
          <p className="text-sm text-foreground/60">Welcome Creek</p>
        </div>
        <Image
          src="/logo-navy-on-white.jpg"
          alt=""
          width={64}
          height={80}
          className="h-14 w-auto"
        />
      </header>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
        <div>
          <p className="font-semibold text-brand-dark">Statement of Extras</p>
          <p className="text-foreground/70">{monthLabel(month)}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-brand-dark">{ownerName}</p>
          {ownerEmail && <p className="text-foreground/70">{ownerEmail}</p>}
        </div>
      </div>

      {charges.length === 0 ? (
        <p className="mt-6 text-sm text-foreground/60">No extras this month.</p>
      ) : (
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-brand">
              <th className="py-2 pr-3 font-semibold">Date</th>
              <th className="py-2 pr-3 font-semibold">Item</th>
              <th className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((c) => (
              <tr key={c.id} className="border-b border-black/5 align-top">
                <td className="whitespace-nowrap py-2 pr-3 text-foreground/70">
                  {formatShortDate(c.charge_date)}
                </td>
                <td className="py-2 pr-3 text-foreground/80">
                  {c.description}
                  {c.horses?.name && (
                    <span className="block text-xs text-foreground/50">{c.horses.name}</span>
                  )}
                </td>
                <td className="whitespace-nowrap py-2 text-right">{formatMoney(c.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-3 text-right font-semibold text-brand-dark">
                Total
              </td>
              <td className="pt-3 text-right font-semibold text-brand-dark">
                {formatMoney(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
      <p className="mt-6 text-xs text-foreground/50">
        Extras are charged in addition to your weekly agistment rate.
      </p>
    </article>
  );
}
