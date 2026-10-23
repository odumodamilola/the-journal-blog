import type { Metadata } from "next";
import { listPublished, summaryColumns } from "@/lib/posts/queries";
import { publishedSite } from "@/lib/cms/queries";
import { publicClient } from "@/lib/supabase/public";
import { PublicShell } from "@/components/blog/PublicShell";
import { Landing } from "@/components/blog/Landing";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const config = await publishedSite();
  return {
    title: `${config.name} — ${config.headline} ${config.emphasis}`,
    description: config.description,
    alternates: { canonical: "/" },
    openGraph: {
      title: config.name,
      description: config.description,
      type: "website",
    },
    twitter: { title: config.name, description: config.description },
  };
}
export default async function Home() {
  const [config, { posts }] = await Promise.all([
    publishedSite(),
    listPublished(),
  ]);
  const featured =
    config.featuredPostId && !posts.some((p) => p.id === config.featuredPostId)
      ? (
          await publicClient()
            .from("posts")
            .select(summaryColumns)
            .eq("id", config.featuredPostId)
            .eq("status", "published")
            .maybeSingle()
        ).data
      : null;
  return (
    <PublicShell config={config}>
      <Landing config={config} posts={posts} featured={featured} />
    </PublicShell>
  );
}
