import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validatePost,
  slugify,
  validId,
  positiveInteger,
} from "../lib/posts/validation";

const valid = {
  title: "A real story",
  slug: "a-real-story",
  excerpt: "A summary",
  content: "# Hello\nA thoughtful article.",
  category: "Technology",
  status: "published",
  cover_image_url: "",
  cover_image_alt: "",
};
test("world news remains editable and publishable in the CMS", () => {
  assert.deepEqual(validatePost({ ...valid, category: "World News" }).errors, {});
});
test("publishing requires title and body, while incomplete drafts remain saveable", () => {
  assert.deepEqual(validatePost(valid).errors, {});
  const missing = validatePost({ ...valid, title: " ", content: " " }).errors;
  assert.ok(missing.title && missing.content);
  assert.deepEqual(
    validatePost({ ...valid, title: "", content: "", status: "draft" }).errors,
    {},
  );
});
test("validation rejects malformed or unsafe values on the server", () => {
  for (const slug of ["../admin", "Bad Slug", "double--dash", "a".repeat(161)])
    assert.ok(validatePost({ ...valid, slug }).errors.slug);
  for (const status of ["admin", null, true])
    assert.ok(validatePost({ ...valid, status }).errors.status);
  assert.ok(validatePost({ ...valid, category: "Hacked" }).errors.category);
  assert.ok(
    validatePost({ ...valid, content: "😀".repeat(50001) }).errors.content,
  );
});
test("covers require approved HTTPS origins and meaningful alternative text", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://images.unsplash.com/test",
    "https://evil.example/a.png",
    "https://user:pass@images.unsplash.com/a.png",
    "https://images.unsplash.com:444/a.png",
  ])
    assert.ok(
      validatePost({
        ...valid,
        cover_image_url: url,
        cover_image_alt: "Description",
      }).errors.cover_image_url,
    );
  assert.ok(
    validatePost({
      ...valid,
      cover_image_url: "https://images.unsplash.com/test",
    }).errors.cover_image_alt,
  );
  assert.deepEqual(
    validatePost({
      ...valid,
      cover_image_url: "https://images.unsplash.com/test",
      cover_image_alt: "A forest",
    }).errors,
    {},
  );
});
test("slug generation and mutation identifiers have bounded safe formats", () => {
  assert.equal(slugify(" Café & Systems! "), "cafe-systems");
  assert.ok(slugify("a ".repeat(200)).length <= 160);
  assert.equal(validId("not-an-id"), false);
  assert.equal(validId("d46aef5d-8be3-471c-b227-119bd044395a"), true);
  for (const value of [0, -1, NaN, Infinity, "1", 1.1])
    assert.equal(positiveInteger(value), false);
});
