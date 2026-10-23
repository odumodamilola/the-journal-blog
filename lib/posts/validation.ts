import { categories, coverHosts } from "../site";

export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image_url: string | null;
  cover_image_alt: string;
  status: "draft" | "published";
};
export type FieldErrors = Partial<Record<keyof PostInput, string>>;
export type SaveResult =
  | { ok: false; message: string; errors?: FieldErrors }
  | { ok: true; id: string; version: number };

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160)
    .replace(/-$/, "");
}

export function validatePost(input: unknown): {
  data: PostInput;
  errors: FieldErrors;
} {
  const source =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  const text = (key: string) =>
    typeof source[key] === "string" ? (source[key] as string) : "";
  const errors: FieldErrors = {};
  const data: PostInput = {
    title: text("title").trim(),
    slug: text("slug").trim(),
    excerpt: text("excerpt").trim(),
    content: text("content"),
    category: text("category"),
    cover_image_url: text("cover_image_url").trim() || null,
    cover_image_alt: text("cover_image_alt").trim(),
    status: source.status === "published" ? "published" : "draft",
  };
  if (source.status !== "published" && source.status !== "draft")
    errors.status = "Choose draft or published.";
  if (data.title.length > 200) errors.title = "Use 200 characters or fewer.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.slug) || data.slug.length > 160)
    errors.slug =
      "Use a slug of 1–160 lowercase letters, numbers, and single hyphens.";
  if (data.excerpt.length > 300)
    errors.excerpt = "Use 300 characters or fewer.";
  if (new TextEncoder().encode(data.content).length > 200000)
    errors.content = "The article must be under 200 KB.";
  if (!(categories as readonly string[]).includes(data.category))
    errors.category = "Choose a supported category.";
  if (data.status === "published") {
    if (!data.title) errors.title = "A title is required to publish.";
    if (!data.content.trim())
      errors.content = "Article content is required to publish.";
  }
  if (data.cover_image_url) {
    try {
      const managed =
        /^\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/master\.webp$/i.test(
          data.cover_image_url,
        );
      const url = new URL(data.cover_image_url, "https://managed.invalid");
      if (
        !managed &&
        (url.protocol !== "https:" ||
          !coverHosts.includes(url.hostname) ||
          url.username ||
          url.password ||
          url.port ||
          data.cover_image_url.length > 2048)
      )
        throw new Error();
    } catch {
      errors.cover_image_url =
        "Use an HTTPS image from Unsplash, Picsum, Googleusercontent, or this project’s Supabase Storage.";
    }
    if (!data.cover_image_alt)
      errors.cover_image_alt =
        "Describe the cover image for readers using assistive technology.";
  }
  if (data.cover_image_alt.length > 300)
    errors.cover_image_alt = "Use 300 characters or fewer.";
  return { data, errors };
}

export function validId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );
}

export function positiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
