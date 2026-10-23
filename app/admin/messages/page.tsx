import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
export const dynamic = "force-dynamic";
export default async function Messages({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const value = Number((await searchParams).page || 1);
  const page = Number.isSafeInteger(value)
    ? Math.min(10000, Math.max(1, value))
    : 1;
  const { data, error, count } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id")
    .range((page - 1) * 15, page * 15 - 1);
  if (error) throw new Error("Unable to load the contact inbox.");
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin" className="text-primary text-sm">
        ← Editorial studio
      </Link>
      <p className="eyebrow mt-8">Private correspondence</p>
      <h1 className="font-editorial-headline text-4xl mt-3">
        The editor’s inbox
      </h1>
      <p className="mt-4 text-sm text-secondary">
        {count || 0} messages · Visible only to the designated administrator.
        Replies open in your email application; nothing is sent automatically.
      </p>
      <div className="mt-8 space-y-5">
        {data.map((message) => (
          <article key={message.id} className="cms-panel">
            <h2 className="font-editorial-headline text-2xl">
              {message.subject}
            </h2>
            <p className="text-xs text-secondary mt-3">
              {message.full_name} ·{" "}
              {new Date(message.created_at).toLocaleString("en", {
                timeZone: "UTC",
              })}{" "}
              UTC
            </p>
            <p className="whitespace-pre-wrap break-words leading-7 my-5">
              {message.message}
            </p>
            <a
              className="button-secondary"
              href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
            >
              Reply to {message.full_name}
            </a>
          </article>
        ))}
      </div>
      {!data.length && (
        <p className="cms-panel mt-8">No messages on this page.</p>
      )}
      <nav
        aria-label="Message pagination"
        className="flex justify-between gap-6 mt-8"
      >
        {page > 1 ? (
          <Link
            href={`/admin/messages?page=${page - 1}`}
            className="button-secondary"
          >
            Previous
          </Link>
        ) : (
          <span />
        )}
        {page * 15 < (count || 0) && (
          <Link
            href={`/admin/messages?page=${page + 1}`}
            className="button-secondary"
          >
            Next
          </Link>
        )}
      </nav>
    </main>
  );
}
