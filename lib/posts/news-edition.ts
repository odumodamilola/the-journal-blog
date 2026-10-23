import edition from "../../content/news/2026-10-23.json";
import photos from "../../content/news/2026-10-23-photos.json";
import { validatePost } from "./validation";

/** Reviewed, one-off editorial batch. This module has no credentials or write access. */
export function prepareNewsEdition() {
  const posts = edition.stories.map((story) => {
    const photo = photos[story.photo as keyof typeof photos];
    if (!photo) throw new Error(`Missing licensed photograph: ${story.key}`);
    const source = new URL(story.source);
    if (source.protocol !== "https:" || !["apnews.com", "en.yna.co.kr"].includes(source.hostname))
      throw new Error(`Unexpected publisher: ${story.key}`);
    // Count all source-derived prose, including the card excerpt and headline.
    const derivedWords = `${story.title} ${story.excerpt} ${story.summary}`.split(/\s+/).length;
    if (derivedWords > 95) throw new Error(`Source summary budget exceeded: ${story.key}`);
    const publisher = "publisher" in story ? story.publisher : "Associated Press";
    const post = {
      title: story.title,
      slug: `news-${edition.edition}-${story.key}`,
      excerpt: story.excerpt,
      category: "World News",
      status: "published" as const,
      cover_image_url: `https://images.unsplash.com/${photo.image}?auto=format&fit=max&w=3840&q=85`,
      cover_image_alt: photo.alt,
      content: [
        `*23 October 2026 briefing · Event/coverage period: ${story.event_date}.*`,
        story.summary,
        `## Source and timing`,
        `Original brief based on [${publisher}'s reporting](${story.source}), checked on 23 October 2026. This edition includes ongoing stories and explicitly dated earlier developments; it is not a live feed or a measured popularity ranking. Consult the linked report for updates.`,
        `## Image credit`,
        `Illustrative archive photograph — not a photograph of this reported event. Photo: [${photo.credit} / Unsplash](${photo.page}), used under the [Unsplash License](https://unsplash.com/license).`,
      ].join("\n\n"),
    };
    const validated = validatePost(post);
    if (Object.keys(validated.errors).length)
      throw new Error(`${story.key}: ${JSON.stringify(validated.errors)}`);
    return validated.data;
  });
  if (posts.length !== 50 || new Set(posts.map((post) => post.slug)).size !== 50)
    throw new Error("The edition must contain exactly 50 distinct posts.");
  if (new Set(edition.stories.map((story) => story.source)).size !== 50)
    throw new Error("Each brief must have a distinct reporting source.");
  return posts;
}
