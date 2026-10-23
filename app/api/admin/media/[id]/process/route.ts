import { cmsSession, apiError } from "@/lib/cms/http";
import { validId } from "@/lib/posts/validation";
import {
  inspectImage,
  encodeImage,
  MAX_UPLOAD_BYTES,
} from "@/lib/cms/image-processing";
import type { MediaVariant } from "@/lib/cms/types";
import type { Json } from "@/lib/types/database";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await cmsSession(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  if (!validId(id)) return apiError("Invalid image.");
  const { supabase, user } = auth.session;
  const { data: jobs, error: claimError } = await supabase.rpc(
    "claim_media_job",
    { p_id: id },
  );
  if (claimError) return apiError("Unable to start image processing.", 500);
  const job = jobs?.[0];
  if (!job)
    return apiError(
      "An image is already processing, or this image is ready. Refresh the library or retry in a few minutes.",
      409,
    );
  const storage = supabase.storage.from("journal-media");
  const uploaded: string[] = [];
  try {
    const { data: original, error } = await storage.download(`${id}/original`);
    if (
      error ||
      !original ||
      original.size > MAX_UPLOAD_BYTES ||
      original.size !== job.original_bytes
    )
      throw new Error(
        "The original upload is incomplete. Upload the image again.",
      );
    const input = Buffer.from(await original.arrayBuffer());
    const metadata = await inspectImage(input);
    const variants: MediaVariant[] = [];
    let width = 0,
      height = 0;
    // Sequential encoding and a database lease bound native CPU/memory use.
    for (const size of [3840, 2560, 1920, 960, 480]) {
      if (size !== 3840 && Math.max(width, height) <= size) continue;
      for (const format of ["webp", "avif"] as const) {
        const result = await encodeImage(
          input,
          size,
          format,
          !!metadata.hasAlpha && metadata.format === "png",
        );
        if (size === 3840) {
          width = result.info.width;
          height = result.info.height;
        }
        const name = `${size === 3840 ? "master" : size}.${format}`;
        const path = `${id}/${job.lease_token}/${name}`;
        const { error: uploadError } = await storage.upload(path, result.data, {
          contentType: `image/${format}`,
          cacheControl: "31536000",
          upsert: false,
        });
        if (uploadError)
          throw new Error("Image processing could not finish. Please retry.");
        uploaded.push(path);
        variants.push({
          name,
          path,
          width: result.info.width,
          height: result.info.height,
          bytes: result.info.size,
          format,
        });
      }
    }
    const { data, error: updateError } = await supabase
      .from("media_assets")
      .update({
        status: "ready",
        width,
        height,
        variants: variants as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("owner_id", user.id)
      .eq("lease_token", job.lease_token!)
      .eq("status", "processing")
      .select("*")
      .maybeSingle();
    if (updateError || !data)
      throw new Error("Processing lease expired. Retry this image.");
    return Response.json(
      { asset: data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (uploaded.length) await storage.remove(uploaded);
    await supabase
      .from("media_assets")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("lease_token", job.lease_token!)
      .eq("status", "processing");
    console.error("Image processing failed", {
      id,
      kind: error instanceof Error ? error.name : "unknown",
    });
    return apiError(
      "The image could not be processed. Check that it is a complete, still image under 20 MB and 60 megapixels. Retry, or export it as JPEG/PNG.",
      422,
    );
  }
}
