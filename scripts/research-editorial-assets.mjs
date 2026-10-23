// Public, selected photo pages only: no search scraping or restricted API access.
import { readFile } from "node:fs/promises";
import sharp from "sharp";
const allSelections = JSON.parse(
  await readFile(
    new URL("../content/editorial-image-selections.json", import.meta.url),
    "utf8",
  ),
);
const selections =
  process.argv.length > 2
    ? allSelections.filter(([slug]) => process.argv.slice(2).includes(slug))
    : allSelections;
async function selected([slug, path, alt]) {
  const page = path.startsWith("https:")
    ? path
    : `https://unsplash.com/photos/${path}`;
  try {
    const response = await fetch(page, { signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error(`Photo page ${response.status}`);
    const html = await response.text();
    const objects = [
      ...html.matchAll(
        /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ].map((m) => JSON.parse(m[1]));
    const photo = objects.find((p) => p["@type"] === "ImageObject");
    if (
      !photo ||
      photo.license !== "https://unsplash.com/license" ||
      !photo.isAccessibleForFree
    )
      throw new Error("Free Unsplash license not confirmed");
    const image = new URL(photo.contentUrl);
    if (image.hostname !== "images.unsplash.com")
      throw new Error("Unapproved image host");
    // Preserve the source URL identifier; request a stable responsive source.
    for (const p of ["crop", "fm", "cs", "q"]) image.searchParams.delete(p);
    image.searchParams.set("w", "2400");
    image.searchParams.set("q", "85");
    image.searchParams.set("fit", "max");
    const check = new URL(image);
    check.searchParams.set("w", "480");
    check.searchParams.set("fm", "jpg");
    const pixels = await fetch(check, { signal: AbortSignal.timeout(25000) });
    if (!pixels.ok || !pixels.headers.get("content-type")?.startsWith("image/"))
      throw new Error(`Image ${pixels.status}`);
    const metadata = await sharp(
      Buffer.from(await pixels.arrayBuffer()),
    ).metadata();
    return {
      slug: `news-2026-10-23-${slug}`,
      category: "World News",
      page,
      creator: photo.creditText,
      license: photo.license,
      image: image.href,
      alt,
      sourceWidth: parseInt(photo.width),
      sourceHeight: parseInt(photo.height),
      verifiedWidth: metadata.width,
      verifiedHeight: metadata.height,
      verifiedAt: new Date().toISOString(),
    };
  } catch (error) {
    return { slug, error: error.message, page };
  }
}
const results = [];
for (let i = 0; i < selections.length; i += 4)
  results.push(
    ...(await Promise.all(selections.slice(i, i + 4).map(selected))),
  );
console.log(JSON.stringify(results));
