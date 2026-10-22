import Link from "next/link";
import { listPublished } from "@/lib/posts/queries";
import { categories } from "@/lib/site";
import { PublicShell } from "@/components/blog/PublicShell";
import { PostCard } from "@/components/blog/PostCard";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "The archive · The Journal",
  description: "Explore thoughtful articles on technology, software, and life.",
  alternates: { canonical: "/blog" },
};
export default async function Blog({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const category = typeof params.category === "string" ? params.category : "";
  const { posts, page, count, totalPages } = await listPublished({
    query,
    category,
    page: Number(params.page || 1),
  });
  const pageHref = (value: number) =>
    `/blog?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(category ? { category } : {}), page: String(value) })}`;
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto w-full max-w-6xl px-6 py-16">
        <p className="eyebrow">The archive</p>
        <h1 className="mt-4 font-editorial-headline text-5xl sm:text-6xl">
          Follow your curiosity.
        </h1>
        <p className="mt-4 text-on-surface-variant">
          Stories, observations, and ideas to spend time with.
        </p>
        <form className="my-10 grid items-end gap-4 rounded-xl border border-outline-variant/40 bg-white p-5 sm:grid-cols-[1fr_1fr_auto]">
          <label className="text-sm font-medium">
            Search articles
            <input
              name="q"
              defaultValue={query}
              maxLength={100}
              placeholder="Title or keyword"
              className="field"
            />
          </label>
          <label className="text-sm font-medium">
            Category
            <select name="category" defaultValue={category} className="field">
              <option value="">All categories</option>
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <button className="button-primary">Search</button>
        </form>
        <div className="mb-6 flex justify-between text-sm text-on-surface-variant">
          <p>
            {count} {count === 1 ? "story" : "stories"} found
          </p>
          {(query || category) && (
            <Link href="/blog" className="text-primary underline">
              Clear filters
            </Link>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {!posts.length && (
          <p className="rounded-xl border border-dashed py-16 text-center text-on-surface-variant">
            No stories match these filters. Try another keyword or category.
          </p>
        )}
        {totalPages > 1 && (
          <nav
            aria-label="Article pagination"
            className="mt-10 flex items-center justify-between gap-4"
          >
            {page > 1 ? (
              <Link className="button-secondary" href={pageHref(page - 1)}>
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link className="button-secondary" href={pageHref(page + 1)}>
                Next →
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
