import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Post, PostSummary } from "@/lib/posts/queries";
import { site } from "@/lib/site";
import { articleDate, articleHeadings, readingMinutes } from "@/lib/editorial";
import { Markdown } from "./Markdown";
import { RichContent } from "../cms/RichContent";
import { PostCover } from "./PostCover";
import { PostCard } from "./PostCard";
import { ReadingTools } from "./ReadingTools";

export function Article({
  post,
  preview = false,
  related = [],
}: {
  post: Post;
  preview?: boolean;
  related?: PostSummary[];
}) {
  const headings =
    post.content_format === "markdown" && readingMinutes(post.content) >= 4
      ? articleHeadings(post.content)
      : [];
  return (
    <main id="main-content" className="journal-container article-page">
      <div id="article-top" className="scroll-mt-44" />
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <Link href={preview ? `/admin/posts/${post.id}/edit` : "/blog"}>
          ← {preview ? "Back to editor" : "All articles"}
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/blog?category=${encodeURIComponent(post.category)}`}>
          {post.category}
        </Link>
      </nav>
      {preview && (
        <p className="mt-6 border border-amber-400 bg-amber-50 p-4 text-sm text-amber-950">
          Private preview · Only the editor can access this page. Showing the
          last saved version.
        </p>
      )}
      <header className="article-heading">
        <p className="eyebrow">{post.category}</p>
        <h1>{post.title || "Untitled draft"}</h1>
        <p className="article-deck">{post.excerpt}</p>
        <div className="article-byline">
          <span className="author-mark">
            <span aria-hidden="true">J.</span>By {site.author}
          </span>
          {post.published_at && (
            <time dateTime={post.published_at}>
              {articleDate(post.published_at)}
            </time>
          )}
          <span>{readingMinutes(post.content)} min read</span>
        </div>
      </header>
      <figure className="article-cover">
        <PostCover
          post={post}
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
        {post.cover_image_url && (
          <figcaption>{post.cover_image_alt}</figcaption>
        )}
      </figure>
      {!preview && <ReadingTools title={post.title} />}
      <div className="reading-layout">
        <aside className="reading-aside">
          {headings.length > 1 && (
            <>
              <p className="eyebrow">In this story</p>
              <nav aria-label="Table of contents">
                {headings.map((heading) => (
                  <a key={heading.id} href={`#${heading.id}`}>
                    {heading.text}
                  </a>
                ))}
              </nav>
            </>
          )}
        </aside>
        <article
          id="article-content"
          className="article-content"
          aria-label="Article content"
        >
          {post.content_format === "rich" ? (
            <RichContent document={post.content_document} />
          ) : (
            <Markdown content={post.content} />
          )}
        </article>
        <div />
      </div>
      <div className="article-ending">
        <p className="text-sm muted">
          A little room for a different perspective.
        </p>
        <Link href={preview ? "/admin" : "/blog"} className="text-link">
          {preview ? "Return to studio" : "Continue exploring"}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
      {!preview && related.length > 0 && (
        <section className="related-reading">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Follow the thread</p>
              <h2>There’s more to the story.</h2>
            </div>
            <Link
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="text-link"
            >
              More in {post.category}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="story-grid">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
