import { NextResponse } from "next/server";
import { publicClient } from "@/lib/supabase/public";
import { adminSession } from "@/lib/auth/require-admin";
import { validId } from "@/lib/posts/validation";
import { variantsOf } from "@/lib/cms/types";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; variant: string }> },
) {
  const { id, variant } = await params;
  const missing = () =>
    new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  if (
    !validId(id) ||
    !/^(master|480|960|1920|2560)\.(webp|avif)$/.test(variant)
  )
    return missing();
  let client = publicClient();
  let { data } = await client
    .from("media_assets")
    .select("variants")
    .eq("id", id)
    .eq("status", "ready")
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) {
    const session = await adminSession();
    if (!session) return missing();
    client = session.supabase;
    const own = await client
      .from("media_assets")
      .select("variants")
      .eq("id", id)
      .eq("owner_id", session.user.id)
      .eq("status", "ready")
      .is("deleted_at", null)
      .maybeSingle();
    data = own.data;
  }
  const file =
    data && variantsOf(data.variants).find((v) => v.name === variant);
  if (!file || !file.path.startsWith(`${id}/`) || file.path.includes(".."))
    return missing();
  const { data: signed, error } = await client.storage
    .from("journal-media")
    .createSignedUrl(file.path, 60);
  if (error || !signed) return missing();
  return NextResponse.redirect(signed.signedUrl, {
    status: 307,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}
