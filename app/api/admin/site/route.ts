import { cmsSession, apiError, smallJson } from "@/lib/cms/http";
import { validateSite, siteMediaIds } from "@/lib/cms/site-config";
import type { Json } from "@/lib/types/database";
import { revalidatePath } from "next/cache";
export async function GET(request: Request) {
  const auth = await cmsSession(request);
  if (auth.error) return auth.error;
  const { data, error } = await auth.session.supabase
    .from("site_drafts")
    .select("config,version")
    .eq("singleton", true)
    .single();
  return error
    ? apiError("Unable to load website draft.", 500)
    : Response.json(data, {
        headers: { "Cache-Control": "private, no-store" },
      });
}
export async function POST(request: Request) {
  const auth = await cmsSession(request);
  if (auth.error) return auth.error;
  try {
    const body = await smallJson(request);
    const config = validateSite(body.config);
    if (
      !Number.isSafeInteger(body.version) ||
      body.version < 1 ||
      typeof body.publish !== "boolean"
    )
      return apiError("Reload the latest website settings.");
    const { data, error } = await auth.session.supabase.rpc(
      "save_site_document",
      {
        p_config: config as unknown as Json,
        p_media_ids: siteMediaIds(config),
        p_expected_version: body.version,
        p_publish: body.publish,
      },
    );
    if (error)
      return apiError(
        error.code === "40001"
          ? "These settings changed in another tab. Copy your changes before reloading."
          : "Unable to save. Check that every selected image is ready and not in trash.",
        409,
      );
    if (body.publish) {
      revalidatePath("/", "layout");
    }
    return Response.json(
      { version: data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Invalid website settings.",
    );
  }
}
