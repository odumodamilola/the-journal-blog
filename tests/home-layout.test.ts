import { test } from "node:test";
import assert from "node:assert/strict";
import { homeComposition } from "../lib/home-layout";
import type { PostSummary } from "../lib/posts/queries";
function post(
  id: number,
  category = "World News",
  image = `photo-${id}`,
): PostSummary {
  return {
    id: String(id),
    slug: `story-${id}`,
    title: `Story ${id}`,
    excerpt: "A real stored story.",
    category,
    cover_image_url: `https://images.unsplash.com/${image}?w=2400`,
    cover_image_alt: "Illustrative photograph",
    published_at: `2026-10-${String(id + 1).padStart(2, "0")}T10:00:00Z`,
    updated_at: "2026-10-23T10:00:00Z",
    created_at: "2026-10-23T10:00:00Z",
    status: "published",
    version: 1,
  };
}
test("homepage composition is deterministic and keeps canonical article images", () => {
  const posts = Array.from({ length: 19 }, (_, i) => post(i));
  posts[0] = post(0, "Technology");
  const before = JSON.stringify(posts),
    result = homeComposition(posts);
  assert.equal(result.hero[0].category, "Technology");
  assert.equal(result.hero.length, 4);
  assert.equal(new Set(result.hero.map((p) => p.id)).size, 4);
  assert.equal(result.recent.length, 6);
  assert.equal(result.worth.length, 4);
  assert.equal(result.selected.length, 5);
  assert.equal(result.archive.length, 4);
  assert.deepEqual(result, homeComposition(posts));
  assert.equal(JSON.stringify(posts), before);
  for (const p of result.hero)
    assert.equal(
      p.cover_image_url,
      posts.find((source) => source.id === p.id)?.cover_image_url,
    );
});
test("configured lead wins, duplicate photos are not repeated in the hero, and sparse data is honest", () => {
  const posts = [
    post(1, "Technology", "shared"),
    post(2, "World News", "shared"),
    post(3),
    post(4),
  ];
  const result = homeComposition(posts, posts[2]);
  assert.equal(result.hero[0].id, "3");
  assert.equal(result.hero.length, 3);
  assert.equal(homeComposition([posts[0]]).hero.length, 1);
  const empty = homeComposition([]);
  assert.deepEqual(empty.hero, []);
  assert.deepEqual(empty.latest, []);
  assert.deepEqual(empty.selected, []);
});
