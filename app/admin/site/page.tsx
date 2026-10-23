import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { readSite } from "@/lib/cms/site-config";
import { SiteEditor } from "@/components/cms/SiteEditor";
export default async function SitePage() {
  const { supabase } = await requireAdmin();
  const [draft, posts, revisions] = await Promise.all([
    supabase.from("site_drafts").select("*").eq("singleton", true).single(),
    supabase
      .from("posts")
      .select("id,title")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(100),
    supabase
      .from("site_revisions")
      .select("version,config,created_at")
      .order("version", { ascending: false })
      .limit(20),
  ]);
  if (draft.error || posts.error || revisions.error)
    throw new Error("Unable to load website settings.");
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/admin" className="text-sm text-primary">
        ← Editorial studio
      </Link>
      <p className="eyebrow mt-8">Make it your own</p>
      <h1 className="mt-3 font-editorial-headline text-5xl">
        Website & appearance
      </h1>
      <SiteEditor
        initial={readSite(draft.data.config)}
        initialVersion={draft.data.version}
        posts={posts.data}
        revisions={revisions.data.map((r) => ({
          ...r,
          config: readSite(r.config),
        }))}
      />
    </main>
  );
}
