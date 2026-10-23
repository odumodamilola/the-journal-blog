import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { PostSummary } from "@/lib/posts/queries";
import type { SiteConfig, SiteSection } from "@/lib/cms/site-config";
import {
  editorialCategories,
  categoryDetails,
  articleDate,
  readingMinutes,
} from "@/lib/editorial";
import { PostCard } from "./PostCard";
import { PostCover } from "./PostCover";
import { CategoryArtwork } from "./CategoryArtwork";
import { Reveal } from "./Reveal";
import { MediaImage } from "../cms/MediaImage";

function SectionHeading({
  eyebrow,
  title,
  href = "/blog",
  label = "View all stories",
}: {
  eyebrow: string;
  title: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <Link href={href} className="text-link">
        {label}
        <ArrowUpRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}

function CustomSection({
  section,
  posts,
}: {
  section: SiteSection;
  posts: PostSummary[];
}) {
  if (section.type === "latest")
    return (
      <section className="home-section">
        <SectionHeading eyebrow="Fresh perspectives" title={section.title} />
        <p className="muted mb-8 text-sm max-w-xl leading-7">{section.body}</p>
        {posts.length ? (
          <div className="story-grid">
            {posts.slice(0, 6).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="empty-editorial">
            <BookOpen
              size={30}
              className="mx-auto text-primary"
              aria-hidden="true"
            />
            <h3 className="font-editorial-headline text-3xl mt-4">
              A new chapter is on its way.
            </h3>
            <p>Our first stories will appear here soon.</p>
          </div>
        )}
      </section>
    );
  if (section.type === "quote")
    return (
      <section className="home-section">
        <Reveal>
          <div className="brand-panel">
            <div>
              <p className="eyebrow mb-5">A note from the Journal</p>
              <h2>{section.title}</h2>
              <p className="muted mt-5 max-w-xl text-sm leading-7">
                {section.body}
              </p>
            </div>
            <BookOpen
              size={48}
              strokeWidth={1}
              className="text-primary"
              aria-hidden="true"
            />
          </div>
        </Reveal>
      </section>
    );
  if (section.type === "cta")
    return (
      <section className="home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Keep exploring</p>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </div>
          {section.href && (
            <Link href={section.href} className="editorial-button">
              {section.label || "Explore"}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>
    );
  if (section.type === "image")
    return (
      <section className="home-section">
        <figure>
          {section.mediaIds[0] && (
            <MediaImage
              id={section.mediaIds[0]}
              className="w-full max-h-[760px] object-cover"
            />
          )}
          {section.title && (
            <h2 className="font-editorial-headline text-4xl mt-6">
              {section.title}
            </h2>
          )}
          {section.body && (
            <figcaption className="muted mt-4 whitespace-pre-line text-sm leading-7 max-w-2xl">
              {section.body}
            </figcaption>
          )}
        </figure>
      </section>
    );
  if (section.type === "split")
    return (
      <section className="home-section about-grid">
        {section.mediaIds[0] && (
          <MediaImage
            id={section.mediaIds[0]}
            className="aspect-[4/5] w-full object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
        <div>
          <p className="eyebrow">From the journal</p>
          <h2 className="font-editorial-headline text-4xl sm:text-5xl mt-5">
            {section.title}
          </h2>
          <p className="muted mt-6 whitespace-pre-line leading-8">
            {section.body}
          </p>
        </div>
      </section>
    );
  return (
    <section className="home-section">
      <h2 className="font-editorial-headline text-4xl">{section.title}</h2>
      <p className="muted my-6 text-sm leading-7">{section.body}</p>
      <div className="story-grid">
        {section.mediaIds.map((id) => (
          <MediaImage
            id={id}
            key={id}
            className="aspect-square w-full object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ))}
      </div>
    </section>
  );
}

export function Landing({
  config,
  posts,
  featured: chosen,
  counts = {},
}: {
  config: SiteConfig;
  posts: PostSummary[];
  featured?: (PostSummary & { content?: string }) | null;
  counts?: Record<string, number>;
}) {
  const featured =
    chosen ||
    posts.find((post) => post.id === config.featuredPostId) ||
    posts.find((post) => post.category !== "World News") ||
    posts[0];
  const seen = new Set<string>(
    featured?.cover_image_url ? [featured.cover_image_url.split("?")[0]] : [],
  );
  const supporting = posts
    .filter((post) => {
      if (post.id === featured?.id) return false;
      const image = post.cover_image_url?.split("?")[0];
      if (image && seen.has(image)) return false;
      if (image) seen.add(image);
      return true;
    })
    .slice(0, 3);
  const latest = [...posts].sort(
    (a, b) =>
      (b.published_at || "").localeCompare(a.published_at || "") ||
      b.id.localeCompare(a.id),
  );
  const secondaryFeature =
    supporting.find((post) => post.category === "Technology") || supporting[0];
  return (
    <main id="main-content" className="journal-container pb-8">
      <section className="home-intro">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>
            {config.headline} <em>{config.emphasis}</em>
          </h1>
        </div>
        <div>
          <p>{config.description}</p>
          <Link href="/blog" className="text-link">
            Enter the reading room <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
      {featured ? (
        <section className="feature-grid" aria-label="Featured reading">
          <article className="feature-lead">
            <Link
              href={`/blog/${featured.slug}`}
              className="card-image-link"
              tabIndex={-1}
              aria-hidden="true"
            >
              <PostCover
                post={featured}
                priority
                sizes="(max-width: 800px) 100vw, 65vw"
              />
            </Link>
            <span className="feature-label">
              <span className="h-1.5 w-1.5 bg-primary rounded-full" />
              {config.featuredPostId === featured.id
                ? "Featured story"
                : "Start here"}
            </span>
            <div className="article-kicker">
              <Link
                href={`/blog?category=${encodeURIComponent(featured.category)}`}
              >
                {featured.category}
              </Link>
              {featured.published_at && (
                <time dateTime={featured.published_at}>
                  {articleDate(featured.published_at)}
                </time>
              )}
              {"content" in featured &&
                typeof featured.content === "string" && (
                  <span>{readingMinutes(featured.content)} min read</span>
                )}
            </div>
            <h2>
              <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
            </h2>
            <p className="feature-excerpt">{featured.excerpt}</p>
            <Link href={`/blog/${featured.slug}`} className="text-link">
              Read the story
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </article>
          <aside className="feature-side">
            <p className="eyebrow">A little further afield</p>
            {supporting.map((post) => (
              <PostCard key={post.id} post={post} compact />
            ))}
            <Link href="/about" className="text-link mt-5">
              The idea behind the Journal{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </aside>
        </section>
      ) : (
        <section className="empty-editorial">
          <CategoryArtwork
            category="Personal Notes"
            className="max-w-sm mx-auto"
          />
          <h2>A new chapter is on its way.</h2>
          <p>Our first stories will appear here soon.</p>
        </section>
      )}
      {config.heroMediaId && (
        <figure className="home-section">
          <MediaImage
            id={config.heroMediaId}
            className="w-full max-h-[700px] object-cover"
            sizes="(max-width: 1360px) 100vw, 1360px"
          />
          <figcaption className="muted mt-3 text-xs">
            The Journal / A visual notebook
          </figcaption>
        </figure>
      )}
      {config.sections
        .filter((section) => section.visible)
        .map((section) => (
          <CustomSection key={section.id} section={section} posts={latest} />
        ))}
      {secondaryFeature && (
        <Reveal>
          <section className="editorial-feature">
            <PostCover
              post={secondaryFeature}
              sizes="(max-width: 800px) 100vw, 50vw"
            />
            <div className="editorial-feature-copy">
              <p className="eyebrow">
                From another perspective / {secondaryFeature.category}
              </p>
              <h2>
                <Link href={`/blog/${secondaryFeature.slug}`}>
                  {secondaryFeature.title}
                </Link>
              </h2>
              <p>{secondaryFeature.excerpt}</p>
              <Link
                href={`/blog/${secondaryFeature.slug}`}
                className="text-link"
              >
                Take a closer look
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </Reveal>
      )}
      <section className="home-section">
        <SectionHeading
          eyebrow="Follow a thread"
          title="Many ways to be curious."
          label="Explore the archive"
        />
        <div className="category-grid">
          {editorialCategories.map((category) => (
            <article key={category} className="category-tile">
              <CategoryArtwork category={category} />
              <div className="category-tile-copy">
                <h3>
                  <Link href={`/blog?category=${encodeURIComponent(category)}`}>
                    {category}
                  </Link>
                </h3>
                <p>{categoryDetails[category].description}</p>
                <div className="category-count">
                  <span>
                    {counts[category] ?? 0}{" "}
                    {(counts[category] ?? 0) === 1 ? "story" : "stories"}
                  </span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
