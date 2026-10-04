import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { monthRange, validMonth } from "@/lib/money";
import { todayLocal } from "@/lib/time";
import Statement, { type StatementCharge } from "@/components/shared/Statement";
import PrintButton from "@/components/shared/PrintButton";

export default async function AdminStatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ ownerId: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { ownerId } = await params;
  const month = validMonth((await searchParams).month, todayLocal().slice(0, 7));
  const { from, to } = monthRange(month);

  const supabase = await createClient();
  const [{ data: owner }, { data: charges }] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", ownerId).single(),
    supabase
      .from("charges")
      .select("id, charge_date, description, amount, horses(name)")
      .eq("owner_id", ownerId)
      .gte("charge_date", from)
      .lt("charge_date", to)
      .order("charge_date"),
  ]);
  if (!owner) notFound();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/admin/billing?month=${month}`} className="text-sm font-medium text-brand-dark underline">
          ← Back to Billing
        </Link>
        <PrintButton label="Print / Save as PDF" />
      </div>
      <Statement
        ownerName={owner.full_name || owner.email || "Owner"}
        ownerEmail={owner.email}
        month={month}
        charges={(charges ?? []) as unknown as StatementCharge[]}
      />
    </div>
  );
}
