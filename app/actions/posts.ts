"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { validateDocument, mediaIdFromUrl } from "@/lib/cms/content";
import type { Json } from "@/lib/types/database";
import {
  validatePost,
  validId,
  positiveInteger,
  type FieldErrors,
} from "@/lib/posts/validation";

export type EditorState = { message?: string; errors?: FieldErrors };
export type DeleteState = { message?: string };

export async function savePost(
  _previous: EditorState,
  form: FormData,
): Promise<EditorState> {
  const { supabase, user } = await requireAdmin();
  const id = form.get("id");
  const version = Number(form.get("version"));
  if (!validId(id) || !positiveInteger(version))
    return { message: "Invalid article. Reload the editor and try again." };
  const source = Object.fromEntries(form.entries());
  let contentDocument: Json | null = null;
  let mediaIds: string[] = [];
  const format = form.get("content_format") === "rich" ? "rich" : "markdown";
  if (format === "rich") {
    try {
      const parsed = validateDocument(
        JSON.parse(String(form.get("content_document"))),
      );
      contentDocument = parsed.document as unknown as Json;
      source.content = parsed.text;
      mediaIds = parsed.mediaIds;
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : "Invalid article content.",
        errors: {
          content: "Check the article formatting and image descriptions.",
        },
      };
    }
  }
  const { data, errors } = validatePost(source);
  if (format === "markdown")
    for (const match of data.content.matchAll(
      /\/media\/([0-9a-f-]{36})\/master\.webp/gi,
    ))
      if (validId(match[1])) mediaIds.push(match[1]);
  const coverId = mediaIdFromUrl(data.cover_image_url);
  if (coverId) mediaIds.push(coverId);
  mediaIds = [...new Set(mediaIds)];
  if (mediaIds.length > 100)
    return { message: "Use at most 100 distinct library images per article." };
  if (mediaIds.length) {
    const media = await supabase
      .from("media_assets")
      .select("id")
      .in("id", mediaIds)
      .eq("status", "ready")
      .eq("owner_id", user.id)
      .is("deleted_at", null);
    if (media.error || media.data?.length !== mediaIds.length)
      return {
        message:
          "An image is unavailable. Choose ready images from your media library.",
      };
  }
  if (Object.keys(errors).length)
    return {
      message: "Check the highlighted fields. Your writing has been kept.",
      errors,
    };

  const { data: existing, error: lookupError } = await supabase
    .from("posts")
    .select("id,slug,published_at,version")
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle();
  if (lookupError)
    return { message: "We couldn’t check this article. Please try again." };
  const editing = form.get("mode") === "edit";
  if (editing && (!existing || existing.version !== version))
    return {
      message:
        "This article was changed or deleted in another tab. Copy your writing before reloading to get the latest version.",
    };
  if (!editing && existing)
    return {
      message:
        "This article has already been saved. Return to the studio to edit it.",
    };
  if (existing?.published_at && existing.slug !== data.slug)
    return {
      errors: { slug: "Published URLs cannot change. Keep the original slug." },
    };

  const payload = {
    ...data,
    author_id: user.id,
    content_format: format,
    content_document: contentDocument,
    media_ids: mediaIds,
  };
  try {
    const result = editing
      ? await supabase
          .from("posts")
          .update(payload)
          .eq("id", id)
          .eq("author_id", user.id)
          .eq("version", version)
          .select("id")
          .maybeSingle()
      : await supabase
          .from("posts")
          .insert({ ...payload, id })
          .select("id")
          .single();
    if (result.error?.code === "23505")
      return {
        errors: { slug: "This URL is already used. Choose a different slug." },
        message: "The article could not be saved.",
      };
    if (result.error) {
      console.error("Post save failed", { code: result.error.code });
      return {
        message:
          "The article could not be saved. Your writing has been kept; please try again.",
      };
    }
    if (!result.data)
      return {
        message:
          "The article changed in another tab. Copy your writing before reloading.",
      };
  } catch {
    return {
      message:
        "Connection interrupted. Your writing has been kept; please try again.",
    };
  }
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  redirect(`/admin?saved=${data.status}`);
}

export async function deletePost(
  _previous: DeleteState,
  form: FormData,
): Promise<DeleteState> {
  const { supabase, user } = await requireAdmin();
  const id = form.get("id");
  const version = Number(form.get("version"));
  if (
    !validId(id) ||
    !positiveInteger(version) ||
    form.get("confirmation") !== "DELETE"
  )
    return { message: "Type DELETE to confirm." };
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id)
    .eq("version", version)
    .select("slug")
    .maybeSingle();
  if (error)
    return { message: "The article could not be deleted. Please try again." };
  if (!data)
    return {
      message: "This article changed in another tab. Reload before deleting.",
    };
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}
