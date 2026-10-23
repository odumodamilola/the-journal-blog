import Link from "next/link";
import Image from "next/image";
import type { PostSummary } from "@/lib/posts/queries";
import { MediaImage } from "../cms/MediaImage";
import { mediaIdFromUrl } from "@/lib/cms/content";
export function PostCard({
  post,
  wide = false,
}: {
  post: PostSummary;
  wide?: boolean;
}) {
  return (
    <article
      className={`group overflow-hidden border-b border-outline-variant/40 transition-colors ${wide && post.cover_image_url ? "grid items-center gap-8 md:grid-cols-2 md:gap-12" : ""}`}
    >
      {post.cover_image_url && (
        <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
          {mediaIdFromUrl(post.cover_image_url) ? (
            <MediaImage
              id={mediaIdFromUrl(post.cover_image_url)!}
              alt={post.cover_image_alt}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="aspect-[3/2] w-full object-cover"
            />
          ) : (
            <Image
              src={post.cover_image_url}
              alt={post.cover_image_alt}
              width={900}
              height={600}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="aspect-[3/2] w-full object-cover"
            />
          )}
        </Link>
      )}
      <div className="py-6">
        <p className="eyebrow">{post.category}</p>
        <h2
          className={`mt-4 font-editorial-headline leading-snug ${wide ? "text-3xl sm:text-4xl" : "text-2xl"}`}
        >
          <Link
            href={`/blog/${post.slug}`}
            className="group-hover:text-primary"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
          {post.excerpt}
        </p>
        {post.published_at && (
          <time
            dateTime={post.published_at}
            className="mt-6 block text-xs text-secondary"
          >
            {new Intl.DateTimeFormat("en", {
              dateStyle: "medium",
              timeZone: "UTC",
            }).format(new Date(post.published_at))}
          </time>
        )}
      </div>
    </article>
  );
}
