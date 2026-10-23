import { cmsSession, apiError, smallJson } from "@/lib/cms/http";
import { imageMimes, MAX_UPLOAD_BYTES } from "@/lib/cms/image-processing";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const auth = await cmsSession(request);
  if (auth.error) return auth.error;
  const { supabase, user } = auth.session;
  const page = Math.max(
    0,
    Math.min(1000, Number(new URL(request.url).searchParams.get("page")) || 0),
  );
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .range(Math.floor(page) * 48, Math.floor(page) * 48 + 47);
  return error
    ? apiError("Unable to load media.", 500)
    : Response.json(
        { assets: data },
        { headers: { "Cache-Control": "private, no-store" } },
      );
}
export async function POST(request: Request) {
  const auth = await cmsSession(request);
  if (auth.error) return auth.error;
  const { supabase, user } = auth.session;
  try {
    const body = await smallJson(request);
    if (
      typeof body.filename !== "string" ||
      !body.filename.trim() ||
      body.filename.length > 200 ||
      !imageMimes.includes(body.mime) ||
      !Number.isInteger(body.bytes) ||
      body.bytes < 1 ||
      body.bytes > MAX_UPLOAD_BYTES
    )
      return apiError(
        "Choose a still JPEG, PNG, WebP, or AVIF image under 20 MB.",
      );
    const { count, error: countError } = await supabase
      .from("media_assets")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);
    if (countError || (count || 0) >= 2000)
      return apiError(
        "Media library limit reached. Contact the site operator.",
        409,
      );
    const { data, error } = await supabase
      .from("media_assets")
      .insert({
        owner_id: user.id,
        filename: body.filename.replace(/[\x00-\x1f]/g, ""),
        mime_type: body.mime,
        original_bytes: body.bytes,
      })
      .select("*")
      .single();
    return error
      ? apiError("Unable to prepare upload.", 500)
      : Response.json(
          { asset: data },
          { status: 201, headers: { "Cache-Control": "private, no-store" } },
        );
  } catch {
    return apiError("Invalid upload request.");
  }
}
