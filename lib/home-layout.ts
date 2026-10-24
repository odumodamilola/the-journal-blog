import type { PostSummary } from "./posts/queries";
export function homeComposition(
  posts: PostSummary[],
  featured?: PostSummary | null,
) {
  const all = [
    ...new Map(
      [...(featured ? [featured] : []), ...posts].map((post) => [
        post.id,
        post,
      ]),
    ).values(),
  ];
  const latest = [...all].sort(
    (a, b) =>
      (b.published_at || "").localeCompare(a.published_at || "") ||
      b.id.localeCompare(a.id),
  );
  const lead =
    featured || all.find((post) => post.category !== "World News") || latest[0];
  const candidates = [lead, latest[3], latest[8], latest[13], ...latest].filter(
    (post): post is PostSummary => !!post,
  );
  const used = new Set<string>(),
    images = new Set<string>();
  const hero = candidates
    .filter((post) => {
      const image = post.cover_image_url?.split("?")[0];
      if (used.has(post.id) || (image && images.has(image))) return false;
      used.add(post.id);
      if (image) images.add(image);
      return true;
    })
    .slice(0, 4);
  const window = (start: number, count: number) =>
    latest.slice(
      start < latest.length ? start : 0,
      (start < latest.length ? start : 0) + count,
    );
  return {
    hero,
    latest,
    recent: window(0, 6),
    worth: window(6, 4),
    selected: window(10, 5),
    archive: window(15, 4),
  };
}
