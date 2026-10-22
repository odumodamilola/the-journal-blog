"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export type LoginState = { message?: string };
export async function signIn(
  _previous: LoginState,
  form: FormData,
): Promise<LoginState> {
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (!email || email.length > 254 || !password || password.length > 1024)
    return { message: "Enter your email and password." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user)
    return {
      message:
        error?.status === 429
          ? "Too many attempts. Please wait a few minutes before trying again."
          : "Unable to sign in. Check your email and password.",
    };
  const { data: admin, error: membershipError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (membershipError || !admin) {
    await supabase.auth.signOut();
    return { message: "This account does not have editorial access." };
  }
  if (password.toLowerCase() === email.toLowerCase())
    redirect("/admin/account?initial=1");
  redirect("/admin");
}
export async function changePassword(
  _previous: LoginState,
  form: FormData,
): Promise<LoginState> {
  const { requireAdmin } = await import("@/lib/auth/require-admin");
  const { supabase, user } = await requireAdmin();
  const password = String(form.get("password") || "");
  if (
    password.length < 12 ||
    password.length > 128 ||
    password.toLowerCase() === user.email?.toLowerCase()
  )
    return {
      message:
        "Choose a password of 12–128 characters that is different from your email address.",
    };
  if (password !== form.get("confirmation"))
    return { message: "The passwords do not match." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    return {
      message:
        "Unable to update the password. Try a different password or sign in again.",
    };
  redirect("/admin?password=updated");
}
export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new Error("Unable to sign out. Please try again.");
  redirect("/login");
}
