import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { PostSummary } from "@/lib/posts/queries";
import type { SiteConfig, SiteSection } from "@/lib/cms/site-config";
import { Fragment } from "react";
import { homeComposition } from "@/lib/home-layout";
import { MagazineHero } from "./MagazineHero";
import {
  MagazineArchiveBoard,
  MagazineBrandBanner,
  MagazineCategoryRows,
  MagazineNewsColumns,
} from "./MagazineSections";
import { PostCard } from "./PostCard";
import { PostCover } from "./PostCover";
import { CategoryArtwork } from "./CategoryArtwork";
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
        <div>
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
        </div>
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
  const lead =
    chosen || posts.find((post) => post.id === config.featuredPostId);
  const composition = homeComposition(posts, lead);
  let desksPlaced = false,
    archivePlaced = false;
  const sections = config.sections
    .filter((section) => section.visible)
    .map((section) => {
      if (section.type === "latest")
        return (
          <MagazineNewsColumns
            key={section.id}
            section={section}
            recent={composition.recent}
            worth={composition.worth}
            selected={composition.selected}
          />
        );
      if (section.type === "quote")
        return <MagazineBrandBanner key={section.id} section={section} />;
      if (section.type === "cta" && !archivePlaced) {
        const addDesks = !desksPlaced;
        desksPlaced = true;
        archivePlaced = true;
        return (
          <Fragment key={section.id}>
            {addDesks && (
              <MagazineCategoryRows
                posts={composition.latest}
                counts={counts}
              />
            )}
            <MagazineArchiveBoard
              posts={composition.archive}
              counts={counts}
              config={config}
              section={section}
            />
          </Fragment>
        );
      }
      return (
        <CustomSection
          key={section.id}
          section={section}
          posts={composition.latest}
        />
      );
    });
  return (
    <main id="main-content" className="journal-container magazine-main">
      {composition.hero.length ? (
        <MagazineHero
          stories={composition.hero.map(
            ({ id, title, slug, category, published_at }) => ({
              id,
              title,
              slug,
              category,
              published_at,
            }),
          )}
          headline={config.headline}
          emphasis={config.emphasis}
          featuredId={config.featuredPostId}
          covers={composition.hero.map((post, index) => (
            <PostCover
              key={post.id}
              post={post}
              priority={index === 0}
              sizes="(max-width:600px) 100vw, (max-width:1400px) 92vw, 1280px"
            />
          ))}
          thumbnails={composition.hero.map((post) => (
            <PostCover
              key={post.id}
              post={post}
              sizes="(max-width:600px) 90px, 300px"
            />
          ))}
        />
      ) : (
        <section className="empty-editorial">
          <CategoryArtwork
            category="Personal Notes"
            className="max-w-sm mx-auto"
          />
          <h1 className="display-title">
            {config.headline} <em>{config.emphasis}</em>
          </h1>
          <p>Our first stories will appear here soon.</p>
        </section>
      )}
      {config.heroMediaId && (
        <figure className="magazine-visual-notebook">
          <MediaImage
            id={config.heroMediaId}
            className="w-full max-h-[700px] object-cover"
            sizes="(max-width:1280px) 100vw, 1280px"
          />
          <figcaption>The Journal / A visual notebook</figcaption>
        </figure>
      )}
      {sections}
      {!desksPlaced && (
        <MagazineCategoryRows posts={composition.latest} counts={counts} />
      )}
    </main>
  );
}
