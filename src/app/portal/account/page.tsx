import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  EmergencyContactForm,
  MyDetailsForm,
} from "@/components/portal/AccountForms";

export default async function PortalAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? "";

  const [{ data: profile }, { data: horses }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", userId).single(),
    supabase
      .from("horses")
      .select("id, name, emergency_contact_name, emergency_contact_phone")
      .eq("owner_id", userId)
      .order("name"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-dark">My Details</h1>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Contact Details
        </h2>
        <p className="mt-1 text-sm text-foreground/60">
          Signed in as {user?.email}. To change your email, please contact us.
        </p>
        <div className="mt-3">
          <MyDetailsForm
            fullName={profile?.full_name ?? ""}
            phone={profile?.phone ?? ""}
          />
        </div>
      </section>

      {horses && horses.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Emergency Contacts
          </h2>
          <p className="mt-1 text-sm text-foreground/60">
            Who we should call about each horse if we can&apos;t reach you.
          </p>
          <div className="mt-3 flex flex-col gap-4">
            {horses.map((horse) => (
              <EmergencyContactForm
                key={horse.id}
                horseId={horse.id}
                horseName={horse.name}
                name={horse.emergency_contact_name ?? ""}
                phone={horse.emergency_contact_phone ?? ""}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
          Password
        </h2>
        <Link
          href="/account/password"
          className="mt-2 inline-block text-sm font-medium text-brand-dark underline"
        >
          Change my password
        </Link>
      </section>
    </div>
  );
}
