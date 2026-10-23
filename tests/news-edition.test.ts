import { test } from "node:test";
import assert from "node:assert/strict";
import { prepareNewsEdition } from "../lib/posts/news-edition";

test("reviewed news edition has exactly 50 unique, sourced, accessible illustrated posts", () => {
  const posts = prepareNewsEdition();
  assert.equal(posts.length, 50);
  for (const post of posts) {
    assert.equal(post.category, "World News");
    assert.equal(post.status, "published");
    assert.ok(post.cover_image_alt);
    assert.ok(post.cover_image_url?.startsWith("https://images.unsplash.com/"));
    assert.match(post.content, /not a photograph of this reported event/);
    assert.match(post.content, /Source and timing/);
    assert.match(post.content, /https:\/\/(apnews.com|en.yna.co.kr)\//);
    assert.match(post.content, /https:\/\/unsplash.com\/license/);
  }
});
