"use server";

import { createClient } from "@/lib/supabase/server";
import { after } from "next/server";
import { alertAdmin, preview } from "@/lib/email";

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !message) {
    return { error: "Please fill in your name, email, and message." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").insert({
    name,
    email,
    phone: phone || null,
    message,
  });

  if (error) {
    return {
      error: "Something went wrong submitting your message. Please try again.",
    };
  }

  after(() =>
    alertAdmin(
      `Website enquiry from ${name}`,
      [`${name} (${email}${phone ? `, ${phone}` : ""}) wrote:`, preview(message, 1000)],
      "/admin/contact",
    ),
  );

  return { success: true };
}
