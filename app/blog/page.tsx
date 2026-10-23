import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Search, BookOpen } from "lucide-react";
import { listPublished } from "@/lib/posts/queries";
import { categories, site } from "@/lib/site";
import { categoryDetails, editorialCategories } from "@/lib/editorial";
import { PublicShell } from "@/components/blog/PublicShell";
import { PostCard } from "@/components/blog/PostCard";
import { CategoryArtwork } from "@/components/blog/CategoryArtwork";
export const dynamic = "force-dynamic";
type Props = {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
};
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const category = (categories as readonly string[]).includes(
    params.category || "",
  )
    ? params.category
    : "";
  const page = Math.max(
    1,
    Math.min(10000, Math.floor(Number(params.page) || 1)),
  );
  const canonical = new URLSearchParams({
    ...(category ? { category } : {}),
    ...(page > 1 ? { page: String(page) } : {}),
  });
  const title = `${params.q ? "Search the Journal" : category || "The archive"}${page > 1 ? ` — Page ${page}` : ""} · ${site.name}`;
  const description = category
    ? categoryDetails[category].description
    : "Explore The Journal: technology, software craftsmanship, practical discoveries and considered perspectives.";
  return {
    title,
    description,
    alternates: { canonical: `/blog${canonical.size ? `?${canonical}` : ""}` },
    robots: {
      index: !params.q && (!params.category || !!category),
      follow: true,
    },
    openGraph: { title, description, type: "website" },
    twitter: { title, description },
  };
}
export default async function Blog({ searchParams }: Props) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const category = (categories as readonly string[]).includes(
    params.category || "",
  )
    ? params.category || ""
    : "";
  const { posts, page, count, totalPages } = await listPublished({
    query,
    category,
    page: Number(params.page || 1),
  });
  const href = (number: number) =>
    `/blog?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(category ? { category } : {}), page: String(number) })}`;
  return (
    <PublicShell>
      <main id="main-content" className="journal-container pb-8">
        <header className={`page-intro ${category ? "category-hero" : ""}`}>
          <div>
            <p className="eyebrow">
              {category
                ? categoryDetails[category].note
                : query
                  ? "The search desk"
                  : "The reading room"}
            </p>
            <h1 className="display-title mt-5">
              {category ||
                (query ? "A thought worth finding." : "Follow your curiosity.")}
            </h1>
            <p className="page-description">
              {category
                ? categoryDetails[category].description
                : "Technology, craft, work and everyday thinking. Take your time. Find something that stays with you."}
            </p>
          </div>
          {category && <CategoryArtwork category={category} />}
        </header>
        <form className="archive-search" action="/blog">
          <label>
            Search articles
            <div className="relative">
              <Search
                size={18}
                aria-hidden="true"
                className="absolute left-3 top-5 text-secondary"
              />
              <input
                name="q"
                defaultValue={query}
                maxLength={100}
                placeholder="An idea, a topic, a story"
                type="search"
                className="field pl-10"
              />
            </div>
          </label>
          <label>
            Category
            <select name="category" defaultValue={category} className="field">
              <option value="">All categories</option>
              {editorialCategories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <button className="button-primary">
            Search <ArrowRight size={16} aria-hidden="true" />
          </button>
        </form>
        <nav aria-label="Filter articles by category" className="filter-rail">
          <Link
            href={`/blog${query ? `?q=${encodeURIComponent(query)}` : ""}`}
            aria-current={!category ? "page" : undefined}
          >
            All articles
          </Link>
          {editorialCategories.map((value) => (
            <Link
              key={value}
              href={`/blog?${new URLSearchParams({ category: value, ...(query ? { q: query } : {}) })}`}
              aria-current={category === value ? "page" : undefined}
            >
              {value}
            </Link>
          ))}
        </nav>
        <div className="archive-count">
          <p>
            {count} {count === 1 ? "story" : "stories"} found
            {query && <span> for “{query}”</span>}
          </p>
          {(query || category) && (
            <Link
              href="/blog"
              className="text-primary underline underline-offset-4"
            >
              Clear filters
            </Link>
          )}
        </div>
        <div className="archive-grid">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              wide={index === 0 && !query}
              priority={index === 0}
            />
          ))}
        </div>
        {!posts.length && (
          <section className="empty-editorial">
            <BookOpen
              className="mx-auto text-primary"
              size={32}
              strokeWidth={1.3}
              aria-hidden="true"
            />
            <h2>
              {category && !query
                ? "A new chapter is taking shape."
                : "A different thread, perhaps?"}
            </h2>
            <p>
              {query || !category
                ? "No stories match these filters. Try another keyword or category."
                : `There are no published ${category} stories yet. Explore another subject while this shelf fills up.`}
            </p>
            <Link href="/blog" className="text-link">
              Explore all articles <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </section>
        )}
        {totalPages > 1 && (
          <nav aria-label="Article pagination" className="pagination">
            {page > 1 ? (
              <Link className="button-secondary" href={href(page - 1)}>
                <ArrowLeft size={15} aria-hidden="true" /> Previous
              </Link>
            ) : (
              <span />
            )}
            <span>
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link className="button-secondary" href={href(page + 1)}>
                Next <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </main>
    </PublicShell>
  );
}
