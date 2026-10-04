import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Called daily by Vercel Cron (see vercel.json) so the free Supabase project
// sees activity and isn't paused. Any query reaching the database counts;
// Row Level Security means this anonymous query returns no data.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { error } = await supabase.from("horses").select("id").limit(1);
  return NextResponse.json({ ok: !error, at: new Date().toISOString() });
}
