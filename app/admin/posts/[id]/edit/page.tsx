import { notFound } from "next/navigation";
import { adminPost } from "@/lib/posts/queries";
import { PostForm } from "@/components/PostForm";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { Post } from "@/lib/posts/queries";
export default async function EditPost({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ revision?: string }>;
}) {
  const post = await adminPost((await params).id);
  if (!post) notFound();
  const { supabase } = await requireAdmin();
  const { data: revisions, error } = await supabase
    .from("post_revisions")
    .select("version,created_at")
    .eq("post_id", post.id)
    .order("version", { ascending: false })
    .limit(30);
  if (error) throw new Error("Unable to load article history.");
  const requested = Number((await searchParams).revision);
  let restored: Post | undefined;
  if (Number.isSafeInteger(requested) && requested > 0) {
    const { data } = await supabase
      .from("post_revisions")
      .select("data")
      .eq("post_id", post.id)
      .eq("version", requested)
      .maybeSingle();
    if (
      data?.data &&
      typeof data.data === "object" &&
      !Array.isArray(data.data)
    ) {
      const previous = data.data as unknown as Post;
      restored = {
        ...post,
        title: previous.title,
        excerpt: previous.excerpt,
        content: previous.content,
        content_format: previous.content_format,
        content_document: previous.content_document,
        category: previous.category,
        cover_image_url: previous.cover_image_url,
        cover_image_alt: previous.cover_image_alt,
      };
    }
  }
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl px-6 py-12">
      {restored && (
        <p className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          Historical revision {requested} loaded. Nothing live has changed.
          Review and save to create a new revision.{" "}
          <Link href={`/admin/posts/${post.id}/edit`} className="underline">
            Cancel restoration
          </Link>
        </p>
      )}
      <PostForm
        key={`${post.id}-${requested || "current"}`}
        post={restored || post}
      />
      {!!revisions?.length && (
        <details className="mt-8 rounded-xl border p-5">
          <summary className="cursor-pointer text-sm font-medium">
            Article revision history
          </summary>
          <p className="mt-4 text-xs text-secondary">
            Load a previous version into the editor, then save it to restore.
            Published URLs remain unchanged.
          </p>
          <div className="mt-4 space-y-3">
            {revisions.map((revision) => (
              <Link
                href={`/admin/posts/${post.id}/edit?revision=${revision.version}`}
                key={revision.version}
                className="block text-sm text-primary underline"
              >
                Load revision {revision.version} ·{" "}
                {new Intl.DateTimeFormat("en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "UTC",
                }).format(new Date(revision.created_at))}{" "}
                UTC
              </Link>
            ))}
          </div>
        </details>
      )}
    </main>
  );
}
