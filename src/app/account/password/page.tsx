import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SetPasswordForm from "@/components/site/SetPasswordForm";

export const metadata = {
  title: "Choose Your Password | Strathyre Park",
};

export default async function SetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/password");

  return <SetPasswordForm email={user.email ?? ""} />;
}
