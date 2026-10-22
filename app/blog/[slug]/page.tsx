import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publishedPost } from "@/lib/posts/queries";
import { site } from "@/lib/site";
import { Article } from "@/components/blog/Article";
import { PublicShell } from "@/components/blog/PublicShell";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await publishedPost((await params).slug);
  if (!post) return {};
  const images = post.cover_image_url
    ? [{ url: post.cover_image_url, alt: post.cover_image_alt }]
    : undefined;
  return {
    title: `${post.title} · ${site.name}`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: [site.author],
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images,
    },
  };
}
export default async function ArticlePage({ params }: Props) {
  const post = await publishedPost((await params).slug);
  if (!post) notFound();
  return (
    <PublicShell>
      <Article post={post} />
    </PublicShell>
  );
}
