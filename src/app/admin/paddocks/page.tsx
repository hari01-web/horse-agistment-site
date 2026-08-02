import { createClient } from "@/lib/supabase/server";
import PaddockMap from "@/components/shared/PaddockMap";

export default async function AdminPaddocksPage() {
  const supabase = await createClient();
  const { data: paddocks } = await supabase
    .from("paddocks")
    .select("*")
    .order("row_position")
    .order("col_position");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">Paddocks</h1>
      <p className="mt-2 text-sm text-foreground/70">
        Click a paddock to view/add irrigation and slashing logs, and manage
        its details.
      </p>

      <div className="mt-6">
        <PaddockMap paddocks={paddocks ?? []} linkBase="/admin/paddocks" />
      </div>
    </div>
  );
}
