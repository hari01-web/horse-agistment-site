"use server";

import { createClient } from "@/lib/supabase/server";
import { homeForUser } from "@/lib/auth-redirect";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type FormState = { error?: string; success?: string };

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.status === 429) {
      return { error: "Too many attempts. Please wait a while and try again." };
    }
    return {
      error:
        "Email or password is incorrect. If you haven't set a password yet, use \"Forgot or set password\" below.",
    };
  }

  redirect(await homeForUser(supabase, data.user.id));
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = formData.get("email")?.toString().trim();
  if (!email) return { error: "Please enter your email." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/account/password`,
  });

  if (error?.status === 429) {
    return {
      error: "Too many emails have been requested. Please wait a while and try again.",
    };
  }

  // Same message whether or not the account exists, so the form can't be
  // used to discover who has an account.
  return {
    success:
      "If that email has an account, we've sent a link to set your password. It can only be used once and expires after an hour.",
  };
}

export async function setPassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = formData.get("password")?.toString() ?? "";
  const confirm = formData.get("confirm")?.toString() ?? "";

  if (password.length < 8) {
    return { error: "Your password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "The two passwords don't match." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) {
    if (error.code === "weak_password") {
      return {
        error:
          "That password is too easy to guess or has appeared in a data leak. Please choose a different one.",
      };
    }
    if (error.code === "same_password") {
      return { error: "That's your current password. Please choose a new one." };
    }
    if (error.code === "reauthentication_needed") {
      return {
        error:
          "For security, please request a fresh password link and try again.",
      };
    }
    return { error: "Something went wrong. Please try again." };
  }

  redirect(await homeForUser(supabase, data.user.id));
}
