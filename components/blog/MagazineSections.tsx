import Link from "next/link";
import {
  ArrowUpRight,
  Asterisk,
  Bookmark,
  Flame,
  Library,
  Mail,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PostSummary } from "@/lib/posts/queries";
import type { SiteConfig, SiteSection } from "@/lib/cms/site-config";
import {
  articleDate,
  categoryDetails,
  editorialCategories,
} from "@/lib/editorial";
import { CategoryArtwork } from "./CategoryArtwork";
import { CategoryIcon } from "./CategoryIcon";
import { PostCover } from "./PostCover";
import { Reveal } from "./Reveal";

function Label({
  title,
  icon: Icon = Asterisk,
  id,
}: {
  title: string;
  icon?: LucideIcon;
  id?: string;
}) {
  return (
    <h2 className="magazine-section-label" id={id}>
      <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
      {title}
    </h2>
  );
}
function Meta({ post }: { post: PostSummary }) {
  return (
    <div className="magazine-meta">
      <Link href={`/blog?category=${encodeURIComponent(post.category)}`}>
        {post.category}
      </Link>
      {post.published_at && (
        <time dateTime={post.published_at}>
          {articleDate(post.published_at)}
        </time>
      )}
    </div>
  );
}
function MiniStory({ post, number }: { post: PostSummary; number?: number }) {
  return (
    <article className="magazine-mini-story">
      <Link
        href={`/blog/${post.slug}`}
        className="magazine-mini-image"
        tabIndex={-1}
        aria-hidden="true"
      >
        <PostCover post={post} sizes="(max-width:600px) 110px, 125px" />
        {number !== undefined && (
          <span className="magazine-reading-number">{number}</span>
        )}
      </Link>
      <div>
        {number === undefined && <Meta post={post} />}
        <h3>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        {number !== undefined && post.published_at && (
          <time className="magazine-number-date" dateTime={post.published_at}>
            {articleDate(post.published_at)}
          </time>
        )}
      </div>
    </article>
  );
}
export function MagazineNewsColumns({
  recent,
  worth,
  selected,
  section,
}: {
  recent: PostSummary[];
  worth: PostSummary[];
  selected: PostSummary[];
  section: SiteSection;
}) {
  const main = worth[0];
  return (
    <div className="magazine-news-columns" aria-label="Discover more stories">
      <section
        className="magazine-recent"
        aria-labelledby={`recent-${section.id}`}
      >
        <Label
          title={
            section.title === "The reading room" ? "Most recent" : section.title
          }
          id={`recent-${section.id}`}
        />
        {section.body && (
          <p className="magazine-section-description">{section.body}</p>
        )}
        <div className="magazine-recent-list">
          {recent.map((post) => (
            <MiniStory key={post.id} post={post} />
          ))}
        </div>
        {!recent.length && (
          <p className="magazine-empty">
            The first stories will appear here soon.
          </p>
        )}
      </section>
      <section
        className="magazine-worth"
        aria-labelledby={`worth-${section.id}`}
      >
        <Label title="Worth reading" icon={Flame} id={`worth-${section.id}`} />
        {main && (
          <article className="magazine-worth-lead">
            <Link href={`/blog/${main.slug}`} tabIndex={-1} aria-hidden="true">
              <PostCover post={main} sizes="(max-width:800px) 100vw, 33vw" />
            </Link>
            <Meta post={main} />
            <h3>
              <Link href={`/blog/${main.slug}`}>{main.title}</Link>
            </h3>
          </article>
        )}
        <div className="magazine-text-stories">
          {worth.slice(1).map((post) => (
            <article key={post.id}>
              <Meta post={post} />
              <h3>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
            </article>
          ))}
        </div>
      </section>
      <section
        className="magazine-selected"
        aria-labelledby={`selected-${section.id}`}
      >
        <Label
          title="Selected reads"
          icon={Bookmark}
          id={`selected-${section.id}`}
        />
        <p className="sr-only">
          A deterministic reading list, not a popularity ranking.
        </p>
        <ol>
          {selected.map((post, index) => (
            <li key={post.id}>
              <MiniStory post={post} number={index + 1} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
export function MagazineBrandBanner({ section }: { section: SiteSection }) {
  return (
    <Reveal>
      <section className="magazine-brand-banner">
        <div>
          <p className="eyebrow">An independent journal of ideas</p>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </div>
        <Link href="/blog">
          Enter the reading room <ArrowUpRight size={22} aria-hidden="true" />
        </Link>
      </section>
    </Reveal>
  );
}
export function MagazineCategoryRows({
  posts,
  counts,
}: {
  posts: PostSummary[];
  counts: Record<string, number>;
}) {
  const desks = [
    "Technology",
    "World News",
    "Software Engineering",
    "Personal Notes",
  ];
  return (
    <div className="magazine-category-desks">
      {desks.map((category) => {
        const stories = posts.filter((post) => post.category === category),
          lead = stories[0],
          href = `/blog?category=${encodeURIComponent(category)}`;
        const suggestions = editorialCategories
          .filter((name) => name !== category)
          .slice(
            category === "Technology" ? 1 : 0,
            category === "Technology" ? 3 : 2,
          );
        return (
          <section
            className="magazine-desk"
            key={category}
            aria-label={`${category} subject desk`}
          >
            <h2 className="magazine-section-label">
              <CategoryIcon category={category} />
              <Link href={href}>{category}</Link>
              <span className="magazine-desk-count">
                {counts[category] ?? 0}{" "}
                {(counts[category] ?? 0) === 1 ? "story" : "stories"}
              </span>
            </h2>
            <div className="magazine-desk-layout">
              <article className="magazine-desk-lead">
                <Link
                  href={lead ? `/blog/${lead.slug}` : href}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="magazine-desk-image"
                >
                  {lead ? (
                    <PostCover
                      post={lead}
                      sizes="(max-width:800px) 100vw, 30vw"
                    />
                  ) : (
                    <CategoryArtwork category={category} />
                  )}
                  <span className="magazine-desk-marker">
                    <Sparkles size={17} aria-hidden="true" />
                  </span>
                </Link>
                <div className="magazine-desk-copy">
                  {lead ? (
                    <>
                      <Meta post={lead} />
                      <h3>
                        <Link href={`/blog/${lead.slug}`}>{lead.title}</Link>
                      </h3>
                      <p>{lead.excerpt}</p>
                    </>
                  ) : (
                    <>
                      <p className="magazine-subject-note">
                        Subject guide ·{" "}
                        {(counts[category] ?? 0) > 0
                          ? "Explore the archive"
                          : "New stories to come"}
                      </p>
                      <h3>
                        <Link href={href}>
                          {categoryDetails[category].note}
                        </Link>
                      </h3>
                      <p>
                        {categoryDetails[category].description}{" "}
                        {(counts[category] ?? 0) > 0
                          ? "Explore the archive for all published stories on this subject."
                          : "There are no published stories on this shelf yet."}
                      </p>
                    </>
                  )}
                  <Link href={href} className="magazine-desk-link">
                    Explore {category}{" "}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </article>
              <aside
                className="magazine-desk-related"
                aria-label={`More to explore alongside ${category}`}
              >
                {stories.length > 1
                  ? stories
                      .slice(1, 3)
                      .map((post) => <MiniStory post={post} key={post.id} />)
                  : suggestions.map((name) => (
                      <Link
                        className="magazine-subject-link"
                        href={`/blog?category=${encodeURIComponent(name)}`}
                        key={name}
                      >
                        <CategoryArtwork category={name} />
                        <span>
                          <small>Explore a subject</small>
                          <strong>{name}</strong>
                          <span>
                            {counts[name] ?? 0} published{" "}
                            {(counts[name] ?? 0) === 1 ? "story" : "stories"}
                          </span>
                        </span>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </Link>
                    ))}
              </aside>
            </div>
          </section>
        );
      })}
    </div>
  );
}
export function MagazineArchiveBoard({
  posts,
  counts,
  config,
  section,
}: {
  posts: PostSummary[];
  counts: Record<string, number>;
  config: SiteConfig;
  section: SiteSection;
}) {
  return (
    <section className="magazine-archive-board">
      <div className="magazine-archive-main">
        <div className="magazine-archive-heading">
          <Label title="From the archive" icon={Library} />
          <Link href="/blog" className="text-link">
            Explore the archive <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="magazine-archive-cards">
          {posts.map((post) => (
            <article key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                tabIndex={-1}
                aria-hidden="true"
              >
                <PostCover post={post} sizes="(max-width:600px) 100vw, 40vw" />
              </Link>
              <Meta post={post} />
              <h3>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
            </article>
          ))}
        </div>
      </div>
      <aside className="magazine-journal-sidebar">
        <section className="magazine-sidebar-feature">
          <Label title="The idea behind it" icon={Sparkles} />
          <CategoryArtwork category="Personal Notes" />
          <h3>
            {config.headline} <em>{config.emphasis}</em>
          </h3>
          <p>{config.description}</p>
          <Link href="/about" className="text-link">
            About the Journal <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>
        <section className="magazine-sidebar-subjects">
          <Label title="Follow a thread" icon={Bookmark} />
          {editorialCategories.map((category) => (
            <Link
              href={`/blog?category=${encodeURIComponent(category)}`}
              key={category}
            >
              <CategoryIcon category={category} />
              <span>{category}</span>
              <span>{counts[category] ?? 0}</span>
            </Link>
          ))}
        </section>
        <section className="magazine-sidebar-cta">
          <Mail size={22} aria-hidden="true" />
          <h3>{section.title}</h3>
          <p>{section.body}</p>
          {section.href && (
            <Link href={section.href} className="text-link">
              {section.label || "Explore"}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          )}
        </section>
      </aside>
    </section>
  );
}
