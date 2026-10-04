import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { homeForUser } from "@/lib/auth-redirect";

// Invite and password-reset links from the Supabase email templates point here
// with a token_hash. Unlike ?code= links, these work in any browser or device.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error && data.user) {
      // Invite and reset links lead to choosing a password.
      if (type === "invite" || type === "recovery") {
        return NextResponse.redirect(`${origin}/account/password`);
      }
      const home = await homeForUser(supabase, data.user.id);
      return NextResponse.redirect(`${origin}${home}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
