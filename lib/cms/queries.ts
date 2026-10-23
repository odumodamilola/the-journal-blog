import "server-only";
import { cache } from "react";
import { publicClient } from "../supabase/public";
import { adminSession } from "../auth/require-admin";
import { readSite } from "./site-config";
import { validId } from "../posts/validation";
export const publishedSite = cache(async () => {
  const { data, error } = await publicClient()
    .from("site_publications")
    .select("config")
    .eq("singleton", true)
    .maybeSingle();
  if (error) throw new Error("Unable to load website settings.");
  return readSite(data?.config);
});
export const mediaAsset = cache(async (id: string) => {
  if (!validId(id)) return null;
  const { data, error } = await publicClient()
    .from("media_assets")
    .select("*")
    .eq("id", id)
    .eq("status", "ready")
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error("Unable to load image.");
  if (data) return data;
  const session = await adminSession();
  if (!session) return null;
  const own = await session.supabase
    .from("media_assets")
    .select("*")
    .eq("id", id)
    .eq("status", "ready")
    .is("deleted_at", null)
    .eq("owner_id", session.user.id)
    .maybeSingle();
  return own.data;
});
