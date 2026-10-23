import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { validateDocument, safeLink, mediaIdFromUrl } from "../lib/cms/content";
import {
  defaultSite,
  validateSite,
  contrast,
  siteMediaIds,
} from "../lib/cms/site-config";
import { inspectImage, encodeImage } from "../lib/cms/image-processing";
import { convertMarkdown } from "../lib/cms/convert-markdown";
import { sameCmsOrigin } from "../lib/cms/origin";
const id = "00000000-0000-4000-8000-00000000e001";
test("CMS origin checks use the real HTTP host, not Next's internal URL or spoofed forwarding headers", () => {
  const request = (origin: string, host: string, forwarded = "") =>
    new Request("http://localhost:3107/api/admin/site", {
      headers: { Origin: origin, Host: host, "X-Forwarded-Host": forwarded },
    });
  assert.equal(
    sameCmsOrigin(request("http://127.0.0.1:3107", "127.0.0.1:3107")),
    true,
  );
  assert.equal(
    sameCmsOrigin(request("https://journal.example", "journal.example")),
    true,
  );
  assert.equal(
    sameCmsOrigin(
      request("https://evil.example", "journal.example", "evil.example"),
    ),
    false,
  );
  assert.equal(sameCmsOrigin(request("null", "journal.example")), false);
});
test("Markdown conversion is explicit, preserves text and refuses unsupported/external image constructs", () => {
  const converted = convertMarkdown(
    "# A heading\n\nA **thoughtful** story with [a link](https://example.test).\n\n- First\n- Second\n\n```ts\nconst a = 1;\n```",
  );
  assert.match(converted.text, /A thoughtful story with a link\./);
  assert.equal(converted.document.content![0].attrs!.level, 2);
  assert.throws(() =>
    convertMarkdown("![External image](https://example.test/a.jpg)"),
  );
  assert.throws(() => convertMarkdown("<script>bad()</script>"));
  assert.deepEqual(
    convertMarkdown(`![A described image](/media/${id}/master.webp)`).mediaIds,
    [id],
  );
});
test("rich documents preserve safe formatting and collect managed images", () => {
  const parsed = validateDocument({
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [
          {
            type: "text",
            text: "A story",
            marks: [
              { type: "bold" },
              {
                type: "textStyle",
                attrs: {
                  color: "#24543d",
                  fontFamily: "Newsreader",
                  fontSize: "24px",
                },
              },
            ],
          },
        ],
      },
      {
        type: "image",
        attrs: {
          assetId: id,
          alt: "An open book",
          caption: "Field notes",
          src: "javascript:bad()",
        },
      },
    ],
  });
  assert.match(parsed.text, /A story/);
  assert.deepEqual(parsed.mediaIds, [id]);
  assert.equal(
    parsed.document.content![1].attrs!.src,
    `/media/${id}/master.webp`,
  );
  assert.equal(mediaIdFromUrl(`/media/${id}/master.webp`), id);
  assert.equal(mediaIdFromUrl("https://evil.test/media/a"), null);
});
test("rich documents and links reject unsafe or unbounded input", () => {
  for (const href of [
    "javascript:alert(1)",
    "data:text/html,hi",
    "//evil.test",
    "/\\evil.test",
    "http://example.test",
    "https://user:pass@example.test",
  ])
    assert.equal(safeLink(href), false, href);
  for (const href of [
    "/blog",
    "https://example.test/hello",
    "mailto:editor@example.test",
  ])
    assert.equal(safeLink(href), true);
  for (const value of [
    { type: "script", text: "bad" },
    {
      type: "doc",
      content: [
        { type: "image", attrs: { src: "https://evil.test/x", alt: "x" } },
      ],
    },
    {
      type: "doc",
      content: [{ type: "image", attrs: { assetId: id, alt: "" } }],
    },
    {
      type: "doc",
      content: [
        {
          type: "text",
          text: "bad",
          marks: [{ type: "link", attrs: { href: "javascript:bad()" } }],
        },
      ],
    },
    { type: "doc", content: [{ type: "text", text: "x".repeat(200001) }] },
  ])
    assert.throws(() => validateDocument(value));
});
test("website schema enforces safe sections, readable colors and managed media", () => {
  assert.deepEqual(validateSite(defaultSite), defaultSite);
  assert.ok(contrast(defaultSite.background, defaultSite.text) > 4.5);
  assert.throws(() =>
    validateSite({ ...defaultSite, text: defaultSite.background }),
  );
  assert.throws(() =>
    validateSite({
      ...defaultSite,
      sections: [{ ...defaultSite.sections[2], href: "javascript:bad()" }],
    }),
  );
  assert.throws(() =>
    validateSite({
      ...defaultSite,
      sections: [defaultSite.sections[0], defaultSite.sections[0]],
    }),
  );
  assert.deepEqual(
    siteMediaIds({
      ...defaultSite,
      heroMediaId: id,
      sections: [{ ...defaultSite.sections[0], mediaIds: [id] }],
    }),
    [id],
  );
});
test("image pipeline caps resolution, preserves aspect ratio, strips metadata, and avoids enlargement", async () => {
  const input = await sharp({
    create: {
      width: 4800,
      height: 3200,
      channels: 3,
      background: { r: 150, g: 170, b: 130 },
    },
  })
    .jpeg({ quality: 95 })
    .withMetadata({ orientation: 1 })
    .toBuffer();
  const metadata = await inspectImage(input);
  assert.equal(metadata.width, 4800);
  for (const format of ["webp", "avif"] as const) {
    const encoded = await encodeImage(input, 3840, format);
    assert.equal(encoded.info.width, 3840);
    assert.equal(encoded.info.height, 2560);
    const output = await sharp(encoded.data).metadata();
    assert.equal(output.exif, undefined);
    assert.ok(encoded.info.size < input.length);
  }
  const small = await sharp({
    create: {
      width: 200,
      height: 300,
      channels: 4,
      background: { r: 30, g: 70, b: 50, alpha: 0.5 },
    },
  })
    .png()
    .toBuffer();
  const encoded = await encodeImage(small, 3840, "webp", true);
  assert.equal(encoded.info.width, 200);
  assert.equal(encoded.info.height, 300);
  assert.equal((await sharp(encoded.data).metadata()).hasAlpha, true);
  await assert.rejects(() => inspectImage(Buffer.from("not an image")));
});
