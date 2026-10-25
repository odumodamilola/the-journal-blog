import type { Metadata } from "next";
import { homePosts, categoryCounts, summaryColumns } from "@/lib/posts/queries";
import { publishedSite } from "@/lib/cms/queries";
import { publicClient } from "@/lib/supabase/public";
import { PublicShell } from "@/components/blog/PublicShell";
import { Landing } from "@/components/blog/Landing";
import { jsonLd } from "@/lib/editorial";
import { site } from "@/lib/site";
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
      url: "/",
    },
    twitter: { title: config.name, description: config.description },
  };
}
export default async function Home() {
  const [config, posts, counts] = await Promise.all([
    publishedSite(),
    homePosts(),
    categoryCounts(),
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
  const lead =
    featured ||
    posts.find((post) => post.id === config.featuredPostId) ||
    posts.find((post) => post.category !== "World News") ||
    posts[0];
  return (
    <PublicShell
      config={config}
      magazine
      headlines={posts.slice(0, 6).map(({ title, slug, published_at }) => ({
        title,
        slug,
        published_at,
      }))}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: config.name,
            url: site.url,
            description: config.description,
          }),
        }}
      />
      <Landing config={config} posts={posts} featured={lead} counts={counts} />
    </PublicShell>
  );
}
