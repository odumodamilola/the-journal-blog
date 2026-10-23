import Link from "next/link";
import Image from "next/image";
import type { PostSummary } from "@/lib/posts/queries";
import type { SiteConfig } from "@/lib/cms/site-config";
import { categories } from "@/lib/site";
import { PostCard } from "./PostCard";
import { MediaImage } from "../cms/MediaImage";
import { mediaIdFromUrl } from "@/lib/cms/content";

function EditorialArtwork() {
  return (
    <div
      className="editorial-art"
      role="img"
      aria-label="Abstract editorial illustration: an open doorway and an orange sun, representing a new perspective"
    >
      <span className="art-grid" />
      <span className="art-sun" />
      <span className="art-arch art-arch-one" />
      <span className="art-arch art-arch-two" />
      <span className="art-orbit" />
      <span className="art-note">
        A DIFFERENT
        <br />
        POINT OF VIEW.
      </span>
      <span className="art-caption">THE JOURNAL / FIELD NOTES</span>
    </div>
  );
}
export function Landing({
  config,
  posts,
  featured: chosen,
}: {
  config: SiteConfig;
  posts: PostSummary[];
  featured?: PostSummary | null;
}) {
  const featured =
    chosen || posts.find((p) => p.id === config.featuredPostId) || posts[0];
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1280px] px-6 pb-16 sm:px-10 sm:pb-24"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 py-5 text-[10px] uppercase tracking-[.18em] sm:text-xs">
        <span>Independent writing. Open minds.</span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Technology · Culture · Craft
        </span>
      </div>
      <section className="grid items-center gap-10 border-b border-current/20 pb-12 pt-7 lg:grid-cols-[1.08fr_1fr] lg:gap-14 lg:pb-16 lg:pt-12">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h1 className="mt-6 max-w-2xl font-editorial-headline text-[clamp(3.1rem,5.8vw,5.7rem)] leading-[.99] tracking-[-.055em]">
            {config.headline}
            <br />
            <span className="italic text-primary">{config.emphasis}</span>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 sm:text-base sm:leading-8">
            {config.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href="/blog" className="editorial-button">
              Enter the reading room <span aria-hidden="true">↗</span>
            </Link>
            <span className="max-w-32 text-xs leading-5">
              Thoughtful reads.
              <br />
              No endless scroll.
            </span>
          </div>
          <div className="mt-10 flex items-center gap-3 text-xs">
            <span className="h-px w-9 bg-current" />A place to pause. An
            invitation to think.
          </div>
        </div>
        <div className="relative">
          {config.heroMediaId ? (
            <div className="overflow-hidden rounded-t-[45%]">
              <MediaImage
                id={config.heroMediaId}
                priority
                className="aspect-[.95] w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 48vw"
              />
            </div>
          ) : (
            <EditorialArtwork />
          )}
          <div className="mt-4 flex justify-between text-[10px] uppercase tracking-[.14em]">
            <span>A fresh perspective</span>
            <span>Made of ideas, not noise</span>
          </div>
        </div>
      </section>
      <nav
        aria-label="Browse categories"
        className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-current/20 py-6 text-xs"
      >
        <span className="font-semibold">Explore a little</span>
        {categories.map((category) => (
          <Link
            href={`/blog?category=${encodeURIComponent(category)}`}
            key={category}
            className="underline-offset-4 hover:underline"
          >
            {category}{" "}
            <span aria-hidden="true" className="ml-1 text-primary">
              ↗
            </span>
          </Link>
        ))}
      </nav>
      {featured && posts.length > 1 && (
        <section className="grid gap-7 border-b border-current/20 py-10 sm:grid-cols-[160px_1fr] sm:py-12">
          <div>
            <p className="eyebrow">The editor’s pick</p>
            <p
              className="mt-4 font-editorial-headline text-6xl italic text-primary"
              aria-hidden="true"
            >
              01<span className="text-3xl"> /</span>
            </p>
          </div>
          <div className="grid gap-7 md:grid-cols-[1fr_240px]">
            <div>
              <p className="text-xs text-secondary">{featured.category}</p>
              <h2 className="mt-3 max-w-2xl font-editorial-headline text-3xl leading-tight tracking-tight sm:text-4xl">
                <Link
                  href={`/blog/${featured.slug}`}
                  className="hover:text-primary"
                >
                  {featured.title}
                </Link>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7">
                {featured.excerpt}
              </p>
              <Link
                href={`/blog/${featured.slug}`}
                className="mt-5 inline-block text-xs font-semibold text-primary underline underline-offset-4"
              >
                Read the story ↗
              </Link>
            </div>
            {featured.cover_image_url && (
              <Link
                href={`/blog/${featured.slug}`}
                tabIndex={-1}
                aria-hidden="true"
              >
                {mediaIdFromUrl(featured.cover_image_url) ? (
                  <MediaImage
                    id={mediaIdFromUrl(featured.cover_image_url)!}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                    sizes="240px"
                  />
                ) : (
                  <Image
                    src={featured.cover_image_url}
                    alt=""
                    width={480}
                    height={360}
                    sizes="240px"
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}
              </Link>
            )}
          </div>
        </section>
      )}
      {config.sections
        .filter((s) => s.visible)
        .map((section) => (
          <section
            key={section.id}
            className={`landing-section landing-section-${section.type}`}
          >
            {section.type === "latest" ? (
              <>
                <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="eyebrow">Stay a little longer</p>
                    <h2 className="mt-3 font-editorial-headline text-4xl tracking-tight sm:text-5xl">
                      {section.title}
                    </h2>
                    <p className="mt-4 max-w-lg text-sm leading-7">
                      {section.body}
                    </p>
                  </div>
                  <Link
                    href="/blog"
                    className="text-xs font-semibold text-primary underline underline-offset-4"
                  >
                    View all stories ↗
                  </Link>
                </div>
                {posts.length ? (
                  <div
                    className={
                      posts.length === 1
                        ? "grid gap-8"
                        : "grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
                    }
                  >
                    {posts.slice(0, 6).map((post) => (
                      <PostCard
                        post={post}
                        key={post.id}
                        wide={posts.length === 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-y border-current/20 py-12">
                    <h3 className="font-editorial-headline text-3xl">
                      A new chapter is on its way.
                    </h3>
                    <p className="mt-3 text-sm">
                      Our first stories will appear here soon.
                    </p>
                  </div>
                )}
              </>
            ) : null}
            {section.type === "quote" && (
              <div className="mx-auto max-w-3xl text-center">
                <span
                  className="font-editorial-headline text-7xl text-primary"
                  aria-hidden="true"
                >
                  “
                </span>
                <h2 className="font-editorial-headline text-4xl leading-tight tracking-tight sm:text-6xl">
                  {section.title}
                </h2>
                <p className="mx-auto mt-6 max-w-lg text-sm leading-7">
                  {section.body}
                </p>
                <span className="mx-auto mt-8 block h-px w-12 bg-primary" />
              </div>
            )}
            {section.type === "cta" && (
              <div className="flex flex-wrap items-end justify-between gap-8 border-y border-current/20 py-10">
                <div>
                  <p className="eyebrow">Keep exploring</p>
                  <h2 className="mt-4 font-editorial-headline text-4xl tracking-tight sm:text-5xl">
                    {section.title}
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-7">
                    {section.body}
                  </p>
                </div>
                {section.href && (
                  <Link href={section.href} className="editorial-button">
                    {section.label || "Explore"} ↗
                  </Link>
                )}
              </div>
            )}
            {section.type === "image" && (
              <figure>
                {section.mediaIds[0] && (
                  <MediaImage
                    id={section.mediaIds[0]}
                    className="max-h-[800px] w-full object-cover"
                  />
                )}
                {section.title && (
                  <h2 className="mt-6 font-editorial-headline text-3xl">
                    {section.title}
                  </h2>
                )}
                {section.body && (
                  <figcaption className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-7">
                    {section.body}
                  </figcaption>
                )}
              </figure>
            )}
            {section.type === "split" && (
              <div className="grid items-center gap-10 md:grid-cols-2">
                {section.mediaIds[0] && (
                  <MediaImage
                    id={section.mediaIds[0]}
                    className="aspect-[4/5] w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
                <div>
                  <p className="eyebrow">From the journal</p>
                  <h2 className="mt-5 font-editorial-headline text-4xl tracking-tight sm:text-5xl">
                    {section.title}
                  </h2>
                  <p className="mt-6 whitespace-pre-line text-base leading-8">
                    {section.body}
                  </p>
                </div>
              </div>
            )}
            {section.type === "gallery" && (
              <>
                <h2 className="font-editorial-headline text-4xl">
                  {section.title}
                </h2>
                <p className="mb-8 mt-4 text-sm leading-7">{section.body}</p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {section.mediaIds.map((id) => (
                    <MediaImage
                      id={id}
                      key={id}
                      className="aspect-square w-full object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        ))}
    </main>
  );
}
