import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { readSite } from "@/lib/cms/site-config";
import { categoryCounts, homePosts, summaryColumns } from "@/lib/posts/queries";
import { PublicShell } from "@/components/blog/PublicShell";
import { Landing } from "@/components/blog/Landing";
export default async function SitePreview() {
  const { supabase } = await requireAdmin();
  const [draft, posts, counts] = await Promise.all([
    supabase
      .from("site_drafts")
      .select("config")
      .eq("singleton", true)
      .single(),
    homePosts(),
    categoryCounts(),
  ]);
  if (draft.error) throw new Error("Unable to load website draft.");
  const config = readSite(draft.data.config);
  const featured = config.featuredPostId
    ? (
        await supabase
          .from("posts")
          .select(summaryColumns)
          .eq("id", config.featuredPostId)
          .eq("status", "published")
          .maybeSingle()
      ).data
    : null;
  return (
    <>
      <div className="border-b border-amber-300 bg-amber-50 p-4 text-center text-sm text-amber-950">
        Private website preview · Last saved draft.{" "}
        <Link href="/admin/site" className="underline">
          Back to website editor
        </Link>
      </div>
      <PublicShell
        config={config}
        magazine
        headlines={posts.slice(0, 6).map(({ title, slug, published_at }) => ({
          title,
          slug,
          published_at,
        }))}
      >
        <Landing
          config={config}
          posts={posts}
          featured={featured}
          counts={counts}
        />
      </PublicShell>
    </>
  );
}
