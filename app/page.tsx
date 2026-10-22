import Link from "next/link";
import { listPublished } from "@/lib/posts/queries";
import { categories } from "@/lib/site";
import { PublicShell } from "@/components/blog/PublicShell";
import { PostCard } from "@/components/blog/PostCard";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { posts } = await listPublished();
  return (
    <PublicShell>
      <main id="main-content" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <section className="border-b border-outline-variant/40 py-16 sm:py-24">
          <p className="eyebrow">An independent journal of ideas</p>
          <h1 className="mt-6 max-w-4xl font-editorial-headline text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            Ideas worth sharing.
            <br />
            <span className="italic text-primary">Stories worth reading.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-on-surface-variant sm:text-lg">
            A quiet space for deliberate thinking, systems craftsmanship, and
            the ideas that stay with you.
          </p>
          <Link href="/blog" className="button-primary mt-8">
            Explore the archive →
          </Link>
        </section>
        <nav
          aria-label="Browse categories"
          className="flex flex-wrap gap-3 py-8"
        >
          {categories.map((category) => (
            <Link
              key={category}
              href={`/blog?category=${encodeURIComponent(category)}`}
              className="rounded-full border border-outline-variant/60 px-4 py-2 text-xs hover:bg-secondary-container"
            >
              {category}
            </Link>
          ))}
        </nav>
        <section className="mt-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Fresh off the press</p>
              <h2 className="mt-3 font-editorial-headline text-4xl">
                Latest stories
              </h2>
            </div>
            <Link href="/blog" className="text-sm text-primary">
              View all →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.slice(0, 6).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {!posts.length && (
            <div className="rounded-xl border border-dashed p-12 text-center">
              <h3 className="font-editorial-headline text-2xl">
                A new chapter is on its way.
              </h3>
              <p className="mt-3 text-sm text-on-surface-variant">
                Our first stories will appear here soon.
              </p>
            </div>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
