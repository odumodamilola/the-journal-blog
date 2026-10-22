import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export const adminSession = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: membership, error: membershipError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (membershipError)
    throw new Error("Unable to verify administrator access.");
  if (!membership) return null;
  return { supabase, user: data.user };
});

export async function requireAdmin() {
  const session = await adminSession();
  if (!session) redirect("/login");
  return session;
}
