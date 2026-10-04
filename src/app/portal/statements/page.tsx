import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { monthRange, shiftMonth, validMonth } from "@/lib/money";
import { todayLocal } from "@/lib/time";
import Statement, { type StatementCharge } from "@/components/shared/Statement";
import PrintButton from "@/components/shared/PrintButton";

export default async function PortalStatementsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const month = validMonth((await searchParams).month, todayLocal().slice(0, 7));
  const { from, to } = monthRange(month);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: profile }, { data: charges }] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", user?.id ?? "").single(),
    supabase
      .from("charges")
      .select("id, charge_date, description, amount, horses(name)")
      .eq("owner_id", user?.id ?? "")
      .gte("charge_date", from)
      .lt("charge_date", to)
      .order("charge_date"),
  ]);

  const navClass =
    "rounded-full border border-brand-dark/30 px-4 py-1.5 text-sm font-medium text-brand-dark hover:bg-brand-cream";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark print:hidden">Statements</h1>
      <div className="mb-4 mt-4 flex flex-wrap items-center gap-2 print:hidden">
        <Link href={`/portal/statements?month=${shiftMonth(month, -1)}`} className={navClass}>
          ← Previous month
        </Link>
        <Link href={`/portal/statements?month=${shiftMonth(month, 1)}`} className={navClass}>
          Next month →
        </Link>
        <PrintButton label="Print / Save as PDF" />
      </div>
      <Statement
        ownerName={profile?.full_name || profile?.email || "You"}
        ownerEmail={profile?.email ?? null}
        month={month}
        charges={(charges ?? []) as unknown as StatementCharge[]}
      />
    </div>
  );
}
