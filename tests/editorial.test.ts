import { test } from "node:test";
import assert from "node:assert/strict";
import {
  articleHeadings,
  jsonLd,
  readingMinutes,
  editorialCategories,
  categoryDetails,
} from "../lib/editorial";
import { validateContact } from "../lib/contact";
import { defaultSite, contrast, validateSite } from "../lib/cms/site-config";
import assets from "../content/editorial-assets.json";

test("every supported editorial category has distinct art direction without invented posts", () => {
  assert.equal(editorialCategories.length, 6);
  assert.equal(
    new Set(
      editorialCategories.map((category) => categoryDetails[category].motif),
    ).size,
    6,
  );
  assert.equal(editorialCategories.at(-1), "World News");
});
test("researched replacement covers are stable, unique, credited and approved", () => {
  assert.equal(assets.photographs.length, 38);
  assert.equal(new Set(assets.photographs.map((p) => p.slug)).size, 38);
  assert.equal(
    new Set(assets.photographs.map((p) => new URL(p.image).pathname)).size,
    38,
  );
  for (const photo of assets.photographs) {
    assert.equal(new URL(photo.image).hostname, "images.unsplash.com");
    assert.equal(photo.license, "https://unsplash.com/license");
    assert.ok(photo.creator && photo.page.startsWith("https://unsplash.com/"));
    assert.ok(photo.sourceWidth >= 2000 && photo.verifiedWidth > 0);
    assert.ok(photo.alt.length >= 20 && /archive|illustrat/i.test(photo.alt));
  }
});
test("brand palette and configured site colours retain accessible contrast", () => {
  validateSite(defaultSite);
  assert.ok(contrast(defaultSite.accent, defaultSite.background) >= 4.5);
  assert.ok(contrast(defaultSite.accent, "#ffffff") >= 4.5);
});
test("JSON-LD cannot terminate its script element through user-controlled content", () => {
  const value = {
    title: '</script><script>alert("x")</script>',
    text: "&\u2028\u2029",
  };
  const result = jsonLd(value);
  assert.ok(!result.includes("<"));
  assert.deepEqual(JSON.parse(result), value);
});
test("reading estimates count readable link text, not source URLs or image paths", () => {
  assert.equal(readingMinutes(""), 1);
  assert.equal(readingMinutes("word ".repeat(441)), 3);
  assert.equal(
    readingMinutes(
      "[A sentence](https://example.com/" + "path".repeat(500) + ")",
    ),
    1,
  );
});
test("article contents anchors match Markdown lines and ignore code fences", () => {
  assert.deepEqual(
    articleHeadings("## First\n```md\n## Not a heading\n```\n### **Second**"),
    [
      { id: "heading-1", text: "First" },
      { id: "heading-5", text: "Second" },
    ],
  );
});
const contact = {
  full_name: "A Reader",
  email: "reader@example.invalid",
  subject: "A question",
  message: "A thoughtful question about a recently published article.",
};
test("contact validation bounds stored data and normalizes the return address", () => {
  assert.deepEqual(validateContact(contact).errors, {});
  assert.equal(
    validateContact({ ...contact, email: " READER@EXAMPLE.INVALID " }).data
      .email,
    contact.email,
  );
  for (const [key, value] of [
    ["full_name", "x"],
    ["email", "a\nb@example.invalid"],
    ["subject", "x".repeat(161)],
    ["message", "too short"],
    ["message", "x".repeat(5001)],
    ["website", "spam"],
  ])
    assert.ok(
      Object.keys(validateContact({ ...contact, [key]: value }).errors).length,
    );
  assert.ok(Object.keys(validateContact(null).errors).length);
});
