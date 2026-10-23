import { readFile } from "node:fs/promises";
import sharp from "sharp";
const manifest = JSON.parse(
  await readFile(
    new URL("../content/editorial-assets.json", import.meta.url),
    "utf8",
  ),
);
const prior = JSON.parse(
  await readFile(
    new URL("../content/news/2026-10-23-photos.json", import.meta.url),
    "utf8",
  ),
);
const covers = [
  ...manifest.photographs.map((p) => ({ slug: p.slug, image: p.image })),
  ...Object.entries(prior)
    .filter(([key]) => key !== "world")
    .map(([key, p]) => ({
      slug: `retained-${key}`,
      image: `https://images.unsplash.com/${p.image}`,
    })),
  {
    slug: "massive-global-cyber-security-flaw",
    image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3",
  },
];
const results = [];
for (let i = 0; i < covers.length; i += 4)
  results.push(
    ...(await Promise.all(
      covers.slice(i, i + 4).map(async (p) => {
        try {
          const url = new URL(p.image);
          url.searchParams.set("w", "480");
          url.searchParams.set("fm", "jpg");
          const response = await fetch(url, {
            signal: AbortSignal.timeout(30000),
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const meta = await sharp(
            Buffer.from(await response.arrayBuffer()),
          ).metadata();
          return {
            slug: p.slug,
            status: response.status,
            width: meta.width,
            height: meta.height,
          };
        } catch (e) {
          return { slug: p.slug, error: e.message };
        }
      }),
    )),
  );
console.log(
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      total: results.length,
      unique: new Set(covers.map((p) => new URL(p.image).pathname)).size,
      results,
    },
    null,
    2,
  ),
);
if (results.some((p) => p.error)) process.exitCode = 1;
