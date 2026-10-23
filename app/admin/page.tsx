import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { signOut } from "@/app/actions/auth";
import { DeletePost } from "@/components/admin/DeletePost";
import { summaryColumns } from "@/lib/posts/queries";

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    saved?: string;
    deleted?: string;
  }>;
}) {
  const { supabase, user } = await requireAdmin();
  const params = await searchParams;
  const term =
    typeof params.q === "string"
      ? params.q
          .slice(0, 100)
          .replace(/[^\p{L}\p{N}\s-]/gu, "")
          .trim()
      : "";
  const status =
    params.status === "draft" || params.status === "published"
      ? params.status
      : "";
  const requestedPage = Number(params.page || 1);
  const page = Number.isSafeInteger(requestedPage)
    ? Math.max(1, Math.min(10000, requestedPage))
    : 1;
  let query = supabase
    .from("posts")
    .select(summaryColumns, { count: "exact" })
    .eq("author_id", user.id);
  if (term) query = query.ilike("title", `%${term}%`);
  if (status) query = query.eq("status", status);
  const [result, draftCount, publishedCount] = await Promise.all([
    query
      .order("updated_at", { ascending: false })
      .order("id")
      .range((page - 1) * 15, page * 15 - 1),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user.id)
      .eq("status", "draft"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user.id)
      .eq("status", "published"),
  ]);
  if (result.error || draftCount.error || publishedCount.error)
    throw new Error("Unable to load the editorial studio.");
  const totalPages = Math.max(1, Math.ceil((result.count || 0) / 15));
  const href = (value: number) =>
    `/admin?${new URLSearchParams({ q: term, status, page: String(value) })}`;
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-14"
    >
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <Link href="/" className="text-sm text-primary">
            ← View the Journal
          </Link>
          <p className="eyebrow mt-8">Your publishing workspace</p>
          <h1 className="mt-3 font-editorial-headline text-4xl sm:text-5xl">
            Editorial studio
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/posts/new" className="button-primary">
            + New article
          </Link>
          <Link href="/admin/account" className="button-secondary">
            Account security
          </Link>
          <Link href="/admin/media" className="button-secondary">
            Media library
          </Link>
          <Link href="/admin/site" className="button-secondary">
            Website & appearance
          </Link>
          <form action={signOut}>
            <button className="button-secondary">Sign out</button>
          </form>
        </div>
      </header>
      <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-5">
        {[
          [
            "All stories",
            (draftCount.count || 0) + (publishedCount.count || 0),
          ],
          ["Published", publishedCount.count || 0],
          ["Private drafts", draftCount.count || 0],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-outline-variant/40 bg-white p-4 sm:p-6"
          >
            <p className="text-xs text-secondary">{label}</p>
            <p className="mt-3 font-editorial-headline text-3xl sm:text-4xl">
              {value}
            </p>
          </div>
        ))}
      </div>
      {(params.saved === "draft" ||
        params.saved === "published" ||
        params.deleted === "1") && (
        <p
          role="status"
          className="mt-6 rounded-lg border border-primary/20 bg-secondary-container/50 p-4 text-sm text-primary"
        >
          {params.deleted === "1"
            ? "Article deleted."
            : params.saved === "published"
              ? "Article published. It is now available to readers."
              : "Draft saved privately."}
        </p>
      )}
      <form className="my-8 flex flex-wrap items-end gap-4">
        <label className="min-w-48 flex-1 text-sm font-medium">
          Find a story
          <input
            name="q"
            defaultValue={term}
            placeholder="Search titles"
            className="field"
          />
        </label>
        <label className="text-sm font-medium">
          Status
          <select name="status" defaultValue={status} className="field">
            <option value="">All statuses</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
          </select>
        </label>
        <button className="button-secondary">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-outline-variant/40 bg-white">
        <table className="w-full min-w-[620px] text-left text-sm">
          <caption className="sr-only">Manage your articles</caption>
          <thead className="bg-surface-container-low text-xs uppercase tracking-wider text-secondary">
            <tr>
              <th scope="col" className="p-5">
                Story
              </th>
              <th scope="col" className="p-5">
                Status
              </th>
              <th scope="col" className="p-5">
                Last saved
              </th>
              <th scope="col" className="p-5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((post) => (
              <tr key={post.id} className="border-t border-outline-variant/30">
                <td className="max-w-sm p-5">
                  <Link
                    className="font-medium hover:text-primary"
                    href={`/admin/posts/${post.id}/edit`}
                  >
                    {post.title || "Untitled draft"}
                  </Link>
                  <p className="mt-1 text-xs text-secondary">{post.category}</p>
                </td>
                <td className="p-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs capitalize ${post.status === "published" ? "bg-secondary-container text-primary" : "bg-surface-container text-secondary"}`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="whitespace-nowrap p-5 text-xs text-secondary">
                  <time dateTime={post.updated_at}>
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(post.updated_at))}
                  </time>
                </td>
                <td className="p-5">
                  <div className="flex gap-4">
                    <Link
                      className="text-primary hover:underline"
                      href={`/admin/posts/${post.id}/edit`}
                    >
                      Edit
                    </Link>
                    <Link
                      className="text-primary hover:underline"
                      href={`/admin/posts/${post.id}/preview`}
                    >
                      Preview
                    </Link>
                    <DeletePost
                      id={post.id}
                      title={post.title}
                      version={post.version}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!result.data.length && (
          <div className="p-12 text-center">
            <h2 className="font-editorial-headline text-2xl">
              {term || status
                ? "No stories match your filters."
                : "Your next story starts here."}
            </h2>
            <p className="mt-3 text-sm text-secondary">
              {term || status
                ? "Try another search or status."
                : "Create a private draft, refine it, then share it with the world."}
            </p>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <nav
          aria-label="Studio pagination"
          className="mt-8 flex justify-between gap-4"
        >
          {page > 1 ? (
            <Link href={href(page - 1)} className="text-primary">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={href(page + 1)} className="text-primary">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
