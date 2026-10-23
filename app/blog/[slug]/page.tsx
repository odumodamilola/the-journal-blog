import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { publishedPost, relatedPosts } from "@/lib/posts/queries";
import { site } from "@/lib/site";
import { Article } from "@/components/blog/Article";
import { PublicShell } from "@/components/blog/PublicShell";
import { jsonLd } from "@/lib/editorial";
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
      url: `/blog/${post.slug}`,
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
  const related = await relatedPosts(post);
  const url = `${site.url}/blog/${post.slug}`;
  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BlogPosting",
                headline: post.title,
                description: post.excerpt,
                url,
                mainEntityOfPage: url,
                datePublished: post.published_at,
                dateModified: post.updated_at,
                ...(post.cover_image_url
                  ? { image: new URL(post.cover_image_url, site.url).href }
                  : {}),
                author: {
                  "@type": process.env.NEXT_PUBLIC_AUTHOR_NAME
                    ? "Person"
                    : "Organization",
                  name: process.env.NEXT_PUBLIC_AUTHOR_NAME || site.name,
                },
                publisher: {
                  "@type": "Organization",
                  name: site.name,
                  url: site.url,
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "The archive",
                    item: `${site.url}/blog`,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: post.category,
                    item: `${site.url}/blog?category=${encodeURIComponent(post.category)}`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: post.title,
                    item: url,
                  },
                ],
              },
            ],
          }),
        }}
      />
      <Article post={post} related={related} />
    </PublicShell>
  );
}
