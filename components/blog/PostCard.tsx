import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PostSummary } from "@/lib/posts/queries";
import { articleDate } from "@/lib/editorial";
import { PostCover } from "./PostCover";
export function PostCard({
  post,
  wide = false,
  compact = false,
  priority = false,
}: {
  post: PostSummary;
  wide?: boolean;
  compact?: boolean;
  priority?: boolean;
}) {
  return (
    <article
      className={`editorial-card ${wide ? "card-wide" : ""} ${compact ? "card-compact" : ""}`}
    >
      <Link
        href={`/blog/${post.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="card-image-link"
      >
        <PostCover
          post={post}
          priority={priority}
          sizes={
            wide
              ? "(max-width: 768px) 100vw, 60vw"
              : compact
                ? "160px"
                : undefined
          }
        />
      </Link>
      <div className="card-copy">
        <div className="article-kicker">
          <Link href={`/blog?category=${encodeURIComponent(post.category)}`}>
            {post.category}
          </Link>
          {post.published_at && (
            <time dateTime={post.published_at}>
              {articleDate(post.published_at)}
            </time>
          )}
        </div>
        <h2>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        {!compact && <p className="card-excerpt">{post.excerpt}</p>}
        <Link
          href={`/blog/${post.slug}`}
          className="card-read-link"
          aria-label={`Read story: ${post.title}`}
        >
          Read story <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
