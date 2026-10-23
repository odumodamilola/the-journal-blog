import { cmsSession, apiError, smallJson } from "@/lib/cms/http";
import { validId } from "@/lib/posts/validation";
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await cmsSession(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  if (!validId(id)) return apiError("Invalid image.");
  try {
    const body = await smallJson(request);
    const patch: {
      alt?: string;
      caption?: string;
      deleted_at?: string | null;
    } = {};
    if (typeof body.alt === "string" && body.alt.length <= 300)
      patch.alt = body.alt.trim();
    if (typeof body.caption === "string" && body.caption.length <= 500)
      patch.caption = body.caption.trim();
    if (typeof body.trash === "boolean")
      patch.deleted_at = body.trash ? new Date().toISOString() : null;
    if (!Object.keys(patch).length)
      return apiError("Provide an image description or trash action.");
    const { data, error } = await auth.session.supabase
      .from("media_assets")
      .update(patch)
      .eq("id", id)
      .eq("owner_id", auth.session.user.id)
      .select("*")
      .maybeSingle();
    if (error)
      return apiError(
        "This image may still be in use. Remove it from articles and website settings before moving it to trash.",
        409,
      );
    return data
      ? Response.json(
          { asset: data },
          { headers: { "Cache-Control": "private, no-store" } },
        )
      : apiError("Image not found.", 404);
  } catch {
    return apiError("Invalid image settings.");
  }
}
