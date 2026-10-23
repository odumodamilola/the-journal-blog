import "server-only";
import { cache } from "react";
import { publicClient } from "@/lib/supabase/public";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { Database } from "@/lib/types/database";
import { categories } from "@/lib/site";
import { validId } from "./validation";

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export const summaryColumns =
  "id,title,slug,excerpt,category,cover_image_url,cover_image_alt,published_at,updated_at,status,version,created_at" as const;
export type PostSummary = Pick<
  Post,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "category"
  | "cover_image_url"
  | "cover_image_alt"
  | "published_at"
  | "updated_at"
  | "status"
  | "version"
  | "created_at"
>;
const PAGE_SIZE = 9;

export async function listPublished(
  options: { page?: number; query?: string; category?: string } = {},
) {
  const page = Number.isFinite(options.page)
    ? Math.min(10000, Math.max(1, Math.floor(options.page!)))
    : 1;
  let query = publicClient()
    .from("posts")
    .select(summaryColumns, { count: "exact" })
    .eq("status", "published");
  if (
    options.category &&
    (categories as readonly string[]).includes(options.category)
  )
    query = query.eq("category", options.category);
  // Strip PostgREST filter syntax and SQL wildcard characters from the search term.
  const term = (options.query || "")
    .slice(0, 100)
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim();
  if (term)
    query = query.or(
      `title.ilike.%${term}%,excerpt.ilike.%${term}%,content.ilike.%${term}%`,
    );
  const { data, error, count } = await query
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error) throw new Error("Unable to load articles. Please try again.");
  return {
    posts: data || [],
    count: count || 0,
    page,
    totalPages: Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)),
  };
}

export const publishedPost = cache(async (slug: string) => {
  const { data, error } = await publicClient()
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error("Unable to load this article.");
  return data;
});

// Cookie-free, published-only data for editorial discovery. Never reuse admin reads.
export const homePosts = cache(async () => {
  const [recent, core] = await Promise.all([
    publicClient()
      .from("posts")
      .select(summaryColumns)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(18),
    publicClient()
      .from("posts")
      .select(summaryColumns)
      .eq("status", "published")
      .neq("category", "World News")
      .order("published_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(4),
  ]);
  if (recent.error || core.error)
    throw new Error("Unable to load articles. Please try again.");
  return [
    ...new Map(
      [...(core.data || []), ...(recent.data || [])].map((post) => [
        post.id,
        post,
      ]),
    ).values(),
  ];
});

export const categoryCounts = cache(async () => {
  const counts: Record<string, number> = Object.fromEntries(
    categories.map((category) => [category, 0]),
  );
  for (let start = 0; ; start += 1000) {
    const { data, error } = await publicClient()
      .from("posts")
      .select("category")
      .eq("status", "published")
      .order("id")
      .range(start, start + 999);
    if (error) throw new Error("Unable to load categories.");
    for (const post of data)
      counts[post.category] = (counts[post.category] || 0) + 1;
    if (data.length < 1000) return counts;
  }
});

export async function relatedPosts(post: Post) {
  const { data, error } = await publicClient()
    .from("posts")
    .select(summaryColumns)
    .eq("status", "published")
    .eq("category", post.category)
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(12);
  if (error) throw new Error("Unable to load related articles.");
  const used = new Set<string>();
  return (data || [])
    .filter((item) => {
      const image = item.cover_image_url?.split("?")[0];
      if (
        image &&
        (image === post.cover_image_url?.split("?")[0] || used.has(image))
      )
        return false;
      if (image) used.add(image);
      return true;
    })
    .slice(0, 3);
}

export async function adminPost(id: string) {
  const { supabase, user } = await requireAdmin();
  if (!validId(id)) return null;
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Unable to load the article.");
  return data;
}

export async function sitemapPosts() {
  const all: { slug: string; updated_at: string }[] = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await publicClient()
      .from("posts")
      .select("slug,updated_at")
      .eq("status", "published")
      .order("id")
      .range(start, start + 999);
    if (error) throw new Error("Unable to generate sitemap.");
    all.push(...data);
    if (data.length < 1000) return all;
  }
}
