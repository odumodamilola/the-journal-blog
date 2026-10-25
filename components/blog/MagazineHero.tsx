"use client";
import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { articleDate } from "@/lib/editorial";
type HeroStory = {
  id: string;
  title: string;
  slug: string;
  category: string;
  published_at: string | null;
};

/** Manual, keyboard-operable selection. No timed rotation or delayed SSR content. */
export function MagazineHero({
  stories,
  covers,
  thumbnails,
  headline,
  emphasis,
  featuredId,
}: {
  stories: HeroStory[];
  covers: ReactNode[];
  thumbnails: ReactNode[];
  headline: string;
  emphasis: string;
  featuredId: string;
}) {
  const [active, setActive] = useState(0);
  const controls = useRef<HTMLDivElement>(null);
  const story = stories[active];
  if (!story) return null;
  return (
    <section
      className="magazine-hero"
      aria-label="Featured reading"
      aria-roledescription="carousel"
    >
      <div className="magazine-hero-stage">
        <div className="magazine-hero-image">{covers[active]}</div>
        <span className="magazine-ribbon">
          {story.id === featuredId ? "Featured story" : "Highlights"}
        </span>
        <div
          className="magazine-hero-copy"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="magazine-hero-meta">
            <Link href={`/blog?category=${encodeURIComponent(story.category)}`}>
              {story.category}
            </Link>
            {story.published_at && (
              <time dateTime={story.published_at}>
                {articleDate(story.published_at)}
              </time>
            )}
          </div>
          <h1>
            <span className="magazine-hero-tagline">
              {headline} <em>{emphasis}</em>
            </span>
            <Link href={`/blog/${story.slug}`}>{story.title}</Link>
          </h1>
          <Link href={`/blog/${story.slug}`} className="magazine-hero-read">
            Read the story <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div
        className="magazine-hero-thumbnails"
        ref={controls}
        style={{
          gridTemplateColumns: `repeat(${stories.length}, minmax(0, 1fr))`,
        }}
      >
        {stories.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={index === active ? "is-active" : ""}
            aria-label={`Show featured story: ${item.title}`}
            aria-pressed={index === active}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % stories.length
                  : event.key === "ArrowLeft"
                    ? (index + stories.length - 1) % stories.length
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? stories.length - 1
                        : -1;
              if (next >= 0) {
                event.preventDefault();
                setActive(next);
                controls.current?.querySelectorAll("button")[next]?.focus();
              }
            }}
          >
            {thumbnails[index]}
            <span className="magazine-thumbnail-title">{item.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
