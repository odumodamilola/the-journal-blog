import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/posts/queries";
import { site } from "@/lib/site";
import { Markdown } from "./Markdown";
export function Article({
  post,
  preview = false,
}: {
  post: Post;
  preview?: boolean;
}) {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-20"
    >
      <Link
        href={preview ? `/admin/posts/${post.id}/edit` : "/blog"}
        className="text-sm text-primary"
      >
        ← {preview ? "Back to editor" : "All articles"}
      </Link>
      {preview && (
        <p className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Private preview · Only the editor can access this page. Showing the
          last saved version.
        </p>
      )}
      <header className="my-12">
        <p className="eyebrow">{post.category}</p>
        <h1 className="mt-4 font-editorial-headline text-4xl leading-tight sm:text-6xl">
          {post.title || "Untitled draft"}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
          {post.excerpt}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-secondary">
          <span>By {site.author}</span>
          {post.published_at && (
            <time dateTime={post.published_at}>
              {new Intl.DateTimeFormat("en", {
                dateStyle: "long",
                timeZone: "UTC",
              }).format(new Date(post.published_at))}
            </time>
          )}
          <span>
            {Math.max(
              1,
              Math.ceil(post.content.trim().split(/\s+/).length / 220),
            )}{" "}
            min read
          </span>
        </div>
      </header>
      {post.cover_image_url && (
        <Image
          src={post.cover_image_url}
          alt={post.cover_image_alt}
          width={1500}
          height={1000}
          sizes="(max-width: 768px) 100vw, 768px"
          priority
          className="mb-12 h-auto w-full rounded-xl"
        />
      )}
      <Markdown content={post.content} />
      <div className="mt-16 border-t pt-8 text-sm text-primary">
        <Link href={preview ? "/admin" : "/blog"}>
          {preview ? "Return to studio" : "Continue exploring →"}
        </Link>
      </div>
    </main>
  );
}
